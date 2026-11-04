"""Authorization regressions for the administrator/editor permission boundary.

All accounts, content, passwords, sessions and images below are disposable test
fixtures. No deployed database or real test-account credential is accessed.
"""
import copy
import io
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

from PIL import Image
from werkzeug.security import generate_password_hash

from server.app import PASSWORD_METHOD, connect, create_app, digest, initialize
from server.validation import validate_content, validate_posts

ORIGIN = 'https://mc2.example.test'
PASSWORD = 'Local permissions fixture 2026!'
NEW_PASSWORD = 'New local permissions fixture 2026!'
ROOT = Path(__file__).resolve().parents[2]
SEED = ROOT / 'seed-people.json'
if not SEED.exists():
    SEED = ROOT / 'src/data/peopleContent.generated.json'


def post(identifier, published=False):
    return {
        'id': identifier, 'slug': identifier, 'date': '2026-11-02',
        'title': {'en': identifier, 'zh-CN': ''},
        'summary': {'en': 'Local test summary', 'zh-CN': ''},
        'body': {'en': 'Local test body', 'zh-CN': ''},
        'image': '', 'published': published,
    }


class RoleAuthorizationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.password_hash = generate_password_hash(PASSWORD, method=PASSWORD_METHOD)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.data_dir = Path(self.temp.name)
        initialize(self.data_dir, SEED)
        self.db = connect(self.data_dir / 'admin.sqlite3')
        self.addCleanup(self.db.close)
        for username, role in [('administrator', 'admin'), ('editor', 'editor')]:
            self.db.execute('''INSERT INTO users(username,password_hash,must_change,created_at,role)
                               VALUES(?,?,0,0,?)''', (username, self.password_hash, role))
        self.app = create_app({'TESTING': True, 'DATA_DIR': self.temp.name, 'ORIGIN': ORIGIN,
                               'TRUSTED_HOSTS': ['mc2.example.test'], 'COOKIE_SECURE': True})
        self.client = self.app.test_client()

    def request(self, method, path, *, token=None, client=None, origin=ORIGIN, **kwargs):
        headers = kwargs.pop('headers', {})
        if origin is not None:
            headers['Origin'] = origin
        if token is not None:
            headers['X-CSRF-Token'] = token
        response = (client or self.client).open(path, method=method, base_url=ORIGIN,
                                               headers=headers, **kwargs)
        response.request.environ['wsgi.input'].close()
        return response

    def login(self, username='editor', client=None, password=PASSWORD):
        response = self.request('POST', '/api/admin/login', client=client,
                                json={'username': username, 'password': password})
        self.assertEqual(response.status_code, 200, response.json)
        return response

    def seed_news(self):
        """Use the actual administrator API to establish published and draft posts."""
        admin = self.app.test_client()
        token = self.login('administrator', admin).json['csrfToken']
        response = self.request('PUT', '/api/admin/news', client=admin, token=token,
                                json={'revision': 1, 'posts': [post('published', True), post('draft')]})
        self.assertEqual(response.status_code, 200, response.json)
        return response.json

    def content_state(self):
        """Snapshot content/history only, allowing a future denied-action audit entry."""
        return {table: [tuple(row) for row in self.db.execute(f'SELECT * FROM {table}')]
                for table in ('people', 'content_history', 'news', 'news_history', 'uploads')}

    def assert_forbidden(self, response):
        self.assertEqual(response.status_code, 403, response.json)
        self.assertEqual(response.json.get('code'), 'insufficientPermission', response.json)

    def cli(self, *args, password=None):
        return subprocess.run([sys.executable, '-m', 'server.cli', '--data-dir', self.temp.name, *args],
                              input=None if password is None else password + '\n',
                              text=True, capture_output=True, cwd=ROOT)

    def test_editor_can_manage_drafts_and_upload_without_publishing(self):
        initial = self.seed_news()
        token = self.login().json['csrfToken']
        session = self.request('GET', '/api/admin/session')
        self.assertEqual(session.json['user']['role'], 'editor')
        self.assertEqual(self.request('GET', '/api/admin/news').json, initial)
        payload = copy.deepcopy(initial)
        payload['posts'][1]['body']['en'] = 'Edited draft body'
        payload['posts'].append(post('new-draft'))
        saved = self.request('PUT', '/api/admin/news', token=token, json=payload)
        self.assertEqual(saved.status_code, 200, saved.json)
        self.assertEqual(saved.json['revision'], 3)
        self.assertEqual(self.request('GET', '/api/news').json['posts'], [post('published', True)])
        delete_drafts = {'revision': saved.json['revision'], 'posts': [post('published', True)]}
        deleted = self.request('PUT', '/api/admin/news', token=token, json=delete_drafts)
        self.assertEqual(deleted.status_code, 200, deleted.json)
        self.assertEqual(self.db.execute('SELECT count(*) FROM news_history').fetchone()[0], 4)
        image = io.BytesIO()
        Image.new('RGB', (24, 24), 'blue').save(image, format='PNG')
        image.seek(0)
        uploaded = self.request('POST', '/api/admin/photos', token=token,
                                data={'file': (image, 'draft-cover.png')})
        self.assertEqual(uploaded.status_code, 201, uploaded.json)
        self.assertRegex(uploaded.json['url'], r'^/media/people/[a-f0-9]{32}\.webp$')
        self.assertEqual(len(list((self.data_dir / 'photos').iterdir())), 1)

    def test_editor_cannot_bypass_publishing_rules_with_valid_session_and_csrf(self):
        initial = self.seed_news()
        token = self.login().json['csrfToken']
        baseline = self.content_state()
        cases = {}
        for field, value in [('title', {'en': 'Changed public title', 'zh-CN': ''}),
                             ('body', {'en': 'Changed public body', 'zh-CN': ''}),
                             ('image', '/images/changed.png'), ('slug', 'changed-public-slug'),
                             ('date', '2026-11-01'), ('published', False)]:
            payload = copy.deepcopy(initial)
            payload['posts'][0][field] = value
            cases['change_' + field] = payload
        removed = copy.deepcopy(initial)
        removed['posts'].pop(0)
        cases['delete_published'] = removed
        publish = copy.deepcopy(initial)
        publish['posts'][1]['published'] = True
        cases['publish_draft'] = publish
        create_published = copy.deepcopy(initial)
        create_published['posts'].append(post('new-public-post', True))
        cases['create_published'] = create_published
        replace_id = copy.deepcopy(initial)
        replace_id['posts'][0]['id'] = 'replacement-id'
        cases['replace_published_id'] = replace_id
        for name, payload in cases.items():
            with self.subTest(attempt=name):
                self.assert_forbidden(self.request('PUT', '/api/admin/news', token=token, json=payload))
                self.assertEqual(self.content_state(), baseline)
                self.assertEqual(self.request('GET', '/api/news').json['posts'], [post('published', True)])

    def test_editor_cannot_change_public_people_even_with_valid_csrf(self):
        token = self.login().json['csrfToken']
        baseline = self.content_state()
        people = self.request('GET', '/api/people').json
        people['content']['en']['members'][0]['researchDirection'] = 'Unauthorized publication'
        self.assert_forbidden(self.request('PUT', '/api/admin/people', token=token, json=people))
        self.assertEqual(self.content_state(), baseline)

    def test_editor_cannot_reorder_published_posts_but_can_reorder_drafts(self):
        admin = self.app.test_client()
        admin_token = self.login('administrator', admin).json['csrfToken']
        payload = {'revision': 1, 'posts': [post('public-first', True), post('draft-first'),
                                          post('public-second', True), post('draft-second')]}
        initial = self.request('PUT', '/api/admin/news', client=admin, token=admin_token, json=payload)
        self.assertEqual(initial.status_code, 200, initial.json)
        token = self.login().json['csrfToken']
        baseline = self.content_state()
        reordered = copy.deepcopy(initial.json)
        reordered['posts'][0], reordered['posts'][2] = reordered['posts'][2], reordered['posts'][0]
        self.assert_forbidden(self.request('PUT', '/api/admin/news', token=token, json=reordered))
        self.assertEqual(self.content_state(), baseline)
        only_drafts = copy.deepcopy(initial.json)
        only_drafts['posts'][1], only_drafts['posts'][3] = only_drafts['posts'][3], only_drafts['posts'][1]
        self.assertEqual(self.request('PUT', '/api/admin/news', token=token, json=only_drafts).status_code, 200)
        self.assertEqual([entry['id'] for entry in self.request('GET', '/api/news').json['posts']],
                         ['public-first', 'public-second'])

    def test_admin_retains_people_and_publication_capabilities(self):
        token = self.login('administrator').json['csrfToken']
        self.assertEqual(self.request('GET', '/api/admin/session').json['user']['role'], 'admin')
        people = self.request('GET', '/api/people').json
        people['content']['en']['members'][0]['researchDirection'] = 'Authorized publication'
        self.assertEqual(self.request('PUT', '/api/admin/people', token=token, json=people).status_code, 200)
        news = {'revision': 1, 'posts': [post('published', True)]}
        published = self.request('PUT', '/api/admin/news', token=token, json=news)
        self.assertEqual(published.status_code, 200, published.json)
        news = published.json
        news['posts'][0]['published'] = False
        withdrawn = self.request('PUT', '/api/admin/news', token=token, json=news)
        self.assertEqual(withdrawn.status_code, 200, withdrawn.json)
        self.assertEqual(self.request('GET', '/api/news').json['posts'], [])

    def test_editor_still_requires_first_password_change_and_csrf(self):
        self.db.execute("UPDATE users SET must_change=1 WHERE username='editor'")
        logged_in = self.login()
        self.assertEqual(logged_in.json['user']['role'], 'editor')
        token = logged_in.json['csrfToken']
        blocked = self.request('GET', '/api/admin/news')
        self.assertEqual(blocked.status_code, 403)
        self.assertTrue(blocked.json['requirePasswordChange'])
        changed = self.request('POST', '/api/admin/password', token=token,
                               json={'currentPassword': PASSWORD, 'newPassword': NEW_PASSWORD})
        self.assertEqual(changed.status_code, 200, changed.json)
        self.assertEqual(changed.json['user']['role'], 'editor')
        self.assertFalse(changed.json['user']['mustChangePassword'])
        payload = {'revision': 1, 'posts': [post('draft')]}
        for bad_token, origin in [(None, ORIGIN), (token, ORIGIN),
                                  (changed.json['csrfToken'], 'https://attacker.test')]:
            with self.subTest(token_supplied=bad_token is not None, origin=origin):
                self.assertEqual(self.request('PUT', '/api/admin/news', token=bad_token,
                                              origin=origin, json=payload).status_code, 403)
        self.assertEqual(self.request('PUT', '/api/admin/news', token=changed.json['csrfToken'],
                                      json=payload).status_code, 200)
        logout = self.request('POST', '/api/admin/logout', token=changed.json['csrfToken'])
        self.assertEqual(logout.status_code, 200)
        self.assertEqual(self.request('GET', '/api/admin/news').status_code, 401)

    def test_session_uses_current_database_role_not_role_at_login(self):
        token = self.login('administrator').json['csrfToken']
        self.db.execute("UPDATE users SET role='editor' WHERE username='administrator'")
        self.assertEqual(self.request('GET', '/api/admin/session').json['user']['role'], 'editor')
        baseline = self.content_state()
        self.assert_forbidden(self.request('PUT', '/api/admin/people', token=token,
                                           json=self.request('GET', '/api/people').json))
        self.assert_forbidden(self.request('PUT', '/api/admin/news', token=token,
                                           json={'revision': 1, 'posts': [post('published', True)]}))
        self.assertEqual(self.content_state(), baseline)

    def test_role_demotion_during_validation_blocks_queued_public_writes(self):
        for endpoint, validator_name, validator in [('people', 'validate_content', validate_content),
                                                    ('news', 'validate_posts', validate_posts)]:
            with self.subTest(endpoint=endpoint):
                self.db.execute("UPDATE users SET role='admin' WHERE username='administrator'")
                token = self.login('administrator').json['csrfToken']
                payload = (self.request('GET', '/api/people').json if endpoint == 'people'
                           else {'revision': 1, 'posts': [post('published', True)]})
                baseline = self.content_state()
                def validate_then_demote(value):
                    validated = validator(value)
                    self.db.execute("UPDATE users SET role='editor' WHERE username='administrator'")
                    return validated
                with patch('server.app.' + validator_name, side_effect=validate_then_demote):
                    response = self.request('PUT', '/api/admin/' + endpoint, token=token, json=payload)
                self.assert_forbidden(response)
                self.assertEqual(self.content_state(), baseline)

    def test_session_revocation_during_image_processing_leaves_no_upload(self):
        token = self.login().json['csrfToken']
        image = io.BytesIO()
        Image.new('RGB', (24, 24), 'blue').save(image, format='PNG')
        image.seek(0)
        original_save = Image.Image.save
        def encode_then_revoke(instance, *args, **kwargs):
            original_save(instance, *args, **kwargs)
            self.db.execute('DELETE FROM sessions')
        baseline = self.content_state()
        with patch.object(Image.Image, 'save', autospec=True, side_effect=encode_then_revoke):
            response = self.request('POST', '/api/admin/photos', token=token,
                                    data={'file': (image, 'queued-photo.png')})
        self.assertEqual(response.status_code, 401, response.json)
        self.assertEqual(self.content_state(), baseline)
        self.assertEqual(list((self.data_dir / 'photos').iterdir()), [])

    def test_cli_roles_revoke_sessions_and_password_reset_preserves_role(self):
        created = self.cli('create-user', 'test-editor', '--role', 'editor', '--password-stdin', password=PASSWORD)
        self.assertEqual(created.returncode, 0, created.stderr)
        self.assertNotIn(PASSWORD, created.stdout + created.stderr)
        user = self.db.execute("SELECT role,must_change FROM users WHERE username='test-editor'").fetchone()
        self.assertEqual(tuple(user), ('editor', 1))
        default = self.cli('create-user', 'default-admin', '--password-stdin', password=PASSWORD)
        self.assertEqual(default.returncode, 0, default.stderr)
        self.assertEqual(self.db.execute("SELECT role FROM users WHERE username='default-admin'").fetchone()[0], 'admin')
        reset = self.cli('reset-password', 'test-editor', '--password-stdin', password=NEW_PASSWORD)
        self.assertEqual(reset.returncode, 0, reset.stderr)
        self.assertEqual(self.db.execute("SELECT role FROM users WHERE username='test-editor'").fetchone()[0], 'editor')
        self.login('administrator')
        second = self.app.test_client()
        self.login('administrator', second)
        changed = self.cli('set-role', 'administrator', 'editor')
        self.assertEqual(changed.returncode, 0, changed.stderr)
        for client in (self.client, second):
            self.assertEqual(self.request('GET', '/api/admin/session', client=client).status_code, 401)
        self.assertEqual(self.login('administrator').json['user']['role'], 'editor')
        listed = self.cli('list-users')
        self.assertEqual(listed.returncode, 0, listed.stderr)
        roles = {user['username']: user['role'] for user in map(json.loads, listed.stdout.splitlines())}
        self.assertEqual(roles['administrator'], 'editor')
        self.assertEqual(roles['test-editor'], 'editor')
        self.assertEqual(roles['default-admin'], 'admin')

    def test_invalid_roles_fail_without_mutating_account_or_session(self):
        self.login('administrator')
        users_before = [tuple(row) for row in self.db.execute('SELECT * FROM users ORDER BY id')]
        sessions_before = [tuple(row) for row in self.db.execute('SELECT * FROM sessions ORDER BY token_hash')]
        for command in [('create-user', 'invalid-account', '--role', 'superadmin', '--password-stdin'),
                        ('set-role', 'administrator', 'superadmin')]:
            result = self.cli(*command, password=PASSWORD)
            self.assertNotEqual(result.returncode, 0)
            self.assertNotIn(PASSWORD, result.stdout + result.stderr)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE users SET role='superadmin' WHERE username='administrator'")
        self.assertEqual([tuple(row) for row in self.db.execute('SELECT * FROM users ORDER BY id')], users_before)
        self.assertEqual([tuple(row) for row in self.db.execute('SELECT * FROM sessions ORDER BY token_hash')], sessions_before)

    def test_legacy_migration_preserves_accounts_sessions_content_and_role_changes(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'admin.sqlite3'
            legacy = connect(path)
            try:
                legacy.executescript('''
                    CREATE TABLE users (
                        id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL COLLATE NOCASE,
                        password_hash TEXT NOT NULL, must_change INTEGER NOT NULL DEFAULT 1,
                        enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL);
                    CREATE TABLE sessions (
                        token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
                        csrf TEXT NOT NULL, expires_at INTEGER NOT NULL);
                    CREATE TABLE people (
                        id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, content TEXT NOT NULL);
                ''')
                legacy.execute('INSERT INTO users VALUES(17,?,?,0,1,123)', ('existing-admin', self.password_hash))
                session = (digest('existing-session'), 17, 'existing-csrf', int(time.time()) + 3600)
                legacy.execute('INSERT INTO sessions VALUES(?,?,?,?)', session)
                content = json.loads(SEED.read_text())
                content['en']['members'][0]['researchDirection'] = 'Preserve this existing edit'
                raw = json.dumps(content)
                legacy.execute('INSERT INTO people VALUES(1,8,?)', (raw,))
                for _ in range(2):
                    initialize(folder, SEED)
                    migrated = dict(legacy.execute('SELECT * FROM users WHERE id=17').fetchone())
                    self.assertEqual(migrated, {'id': 17, 'username': 'existing-admin',
                        'password_hash': self.password_hash, 'must_change': 0, 'enabled': 1,
                        'created_at': 123, 'role': 'admin'})
                    self.assertEqual(tuple(legacy.execute('SELECT * FROM sessions').fetchone()), session)
                    self.assertEqual(tuple(legacy.execute('SELECT * FROM people').fetchone()), (1, 8, raw))
                legacy.execute("UPDATE users SET role='editor' WHERE id=17")
                initialize(folder, SEED)
                self.assertEqual(legacy.execute('SELECT role FROM users WHERE id=17').fetchone()[0], 'editor')
                self.assertEqual(tuple(legacy.execute('SELECT * FROM sessions').fetchone()), session)
                with self.assertRaises(sqlite3.IntegrityError):
                    legacy.execute("UPDATE users SET role='unknown' WHERE id=17")
            finally:
                legacy.close()


if __name__ == '__main__':
    unittest.main()
