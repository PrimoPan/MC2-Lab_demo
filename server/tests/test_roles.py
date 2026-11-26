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
        for username, role in [('primo', 'admin'), ('administrator', 'admin'), ('editor', 'editor')]:
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
        """Prepare through the real review endpoints, never alter live DB directly."""
        admin = self.app.test_client()
        token = self.login('primo', admin).json['csrfToken']
        response = self.request('PUT', '/api/admin/news', client=admin, token=token,
                                json={'revision': 1, 'posts': [post('published', True), post('draft')]})
        self.assertEqual(response.status_code, 200, response.json)
        submitted = self.request('POST', '/api/admin/review/submit', client=admin, token=token,
                                 json={'revision': response.json['revision']})
        approved = self.request('POST', '/api/admin/review/approve', client=admin, token=token,
                                json={'revision': submitted.json['revision']})
        self.assertEqual(approved.status_code, 200, approved.json)
        return self.request('GET', '/api/admin/news', client=admin).json

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

    def test_editor_can_add_delete_members_and_edit_alumni_and_boss_without_publishing(self):
        token = self.login().json['csrfToken']
        before = self.request('GET', '/api/people').json
        draft = self.request('GET', '/api/admin/people').json
        content = draft['content']
        for locale in ('en', 'zh-CN'):
            content[locale]['members'].pop()
            new = copy.deepcopy(content[locale]['members'][1])
            new.update(key='new-test-member', name='New Test Member')
            content[locale]['members'].append(new)
            boss = next(member for member in content[locale]['members'] if member['role'] == 'chair')
            boss['positionTitle'] = 'Revised title'
            content[locale]['alumniGroups'][0]['entries'][0]['detail'] = 'Revised alumni info'
            content[locale]['leader'] = {
                'pageLabel': 'Leader', 'documentTitle': 'Leader | MC2', 'profileAlt': 'Leader photograph',
                'title': 'Revised professor profile', 'subtitle': 'Revised affiliation', 'meta': 'Updated metadata',
                'homepageLabel': 'Visit homepage', 'photo': '/images/leader-replacement.png',
                'homepage': 'https://example.test/leader', 'projectsTitle': 'Selected projects',
                'sections': [{'title': 'Biography', 'paragraphs': ['Revised biography', 'Revised teaching']},
                             {'title': 'Research', 'paragraphs': ['Revised research interests']}],
                'projects': [{'title': 'New project', 'body': 'New project description'}]}
        response = self.request('PUT', '/api/admin/people', token=token,
                                json={'revision': draft['revision'], 'content': content})
        self.assertEqual(response.status_code, 200, response.json)
        self.assertEqual(response.json['workflow']['status'], 'draft')
        self.assertEqual(self.request('GET', '/api/people').json, before)
        self.assertEqual(self.request('GET', '/api/admin/people').json['content'], content)
        image = io.BytesIO()
        Image.new('RGB', (24, 24), 'blue').save(image, format='PNG')
        image.seek(0)
        uploaded = self.request('POST', '/api/admin/photos', token=token,
                                data={'file': (image, 'draft-cover.png')})
        self.assertEqual(uploaded.status_code, 201, uploaded.json)
        next_news = [post('combined-news', True)]
        news_saved = self.request('PUT', '/api/admin/news', token=token,
                                  json={'revision': response.json['revision'], 'posts': next_news})
        self.assertEqual(news_saved.status_code, 200, news_saved.json)
        submitted = self.request('POST', '/api/admin/review/submit', token=token,
                                 json={'revision': news_saved.json['revision']})
        self.assertEqual(submitted.status_code, 200, submitted.json)
        self.assertEqual(self.request('GET', '/api/people').json, before)
        self.assertEqual(self.request('GET', '/api/news').json['posts'], [])
        self.assertEqual(submitted.json['content'], content)
        owner_token = self.login('primo').json['csrfToken']
        approved = self.request('POST', '/api/admin/review/approve', token=owner_token,
                                json={'revision': submitted.json['revision']})
        self.assertEqual(approved.status_code, 200, approved.json)
        public = self.request('GET', '/api/people').json['content']
        self.assertEqual(public, content)
        self.assertEqual(self.request('GET', '/api/news').json['posts'], next_news)
        before_keys = {m['key'] for m in before['content']['en']['members']}
        after_keys = {m['key'] for m in public['en']['members']}
        self.assertEqual(after_keys - before_keys, {'new-test-member'})
        self.assertEqual(len(before_keys - after_keys), 1)
        self.assertEqual(public['en']['alumniGroups'][0]['entries'][0]['detail'], 'Revised alumni info')
        self.assertEqual(public['en']['leader']['sections'][1]['paragraphs'], ['Revised research interests'])
        self.assertEqual(public['en']['leader']['projects'][0]['title'], 'New project')

    def test_uploaded_media_is_private_until_approved_and_private_again_after_removal(self):
        token = self.login().json['csrfToken']
        anonymous = self.app.test_client()
        image = io.BytesIO()
        Image.new('RGB', (24, 24), 'blue').save(image, format='PNG')
        image.seek(0)
        uploaded = self.request('POST', '/api/admin/photos', token=token,
                                data={'file': (image, 'draft-cover.png')})
        url = uploaded.json['url']
        private = self.request('GET', url, client=anonymous)
        self.assertEqual(private.status_code, 404)
        self.assertEqual(private.headers['Cache-Control'], 'private, no-store')
        preview = self.request('GET', url)
        self.assertEqual(preview.status_code, 200)
        self.assertEqual(preview.headers['Cache-Control'], 'private, no-store')
        preview.close()
        self.db.execute("UPDATE users SET must_change=1 WHERE username='editor'")
        self.assertEqual(self.request('GET', url).status_code, 404)
        self.db.execute("UPDATE users SET must_change=0 WHERE username='editor'")
        value = post('with-private-section', True)
        value['sections'] = [{'id': 'section', 'layout': 'gallery', 'heading': {'en': '', 'zh-CN': ''},
                              'body': {'en': '', 'zh-CN': ''}, 'images': [{'id': 'image', 'url': url,
                              'alt': {'en': 'Uploaded image', 'zh-CN': ''}, 'caption': {'en': '', 'zh-CN': ''}}]}]
        saved = self.request('PUT', '/api/admin/news', token=token, json={'revision': 1, 'posts': [value]})
        self.assertEqual(saved.status_code, 200, saved.json)
        self.assertEqual(self.request('GET', url, client=anonymous).status_code, 404)
        submitted = self.request('POST', '/api/admin/review/submit', token=token,
                                 json={'revision': saved.json['revision']})
        self.assertEqual(self.request('GET', url, client=anonymous).status_code, 404)
        owner = self.app.test_client()
        owner_token = self.login('primo', owner).json['csrfToken']
        approved = self.request('POST', '/api/admin/review/approve', client=owner, token=owner_token,
                                json={'revision': submitted.json['revision']})
        self.assertEqual(approved.status_code, 200, approved.json)
        visible = self.request('GET', url, client=anonymous)
        self.assertEqual(visible.status_code, 200)
        self.assertEqual(visible.headers['Cache-Control'], 'private, no-store')
        visible.close()
        value['published'] = False
        saved = self.request('PUT', '/api/admin/news', token=token,
                             json={'revision': approved.json['revision'], 'posts': [value]})
        still_visible = self.request('GET', url, client=anonymous)
        self.assertEqual(still_visible.status_code, 200)
        still_visible.close()
        submitted = self.request('POST', '/api/admin/review/submit', token=token,
                                 json={'revision': saved.json['revision']})
        withdrawn = self.request('POST', '/api/admin/review/approve', client=owner, token=owner_token,
                                 json={'revision': submitted.json['revision']})
        self.assertEqual(withdrawn.status_code, 200, withdrawn.json)
        self.assertEqual(self.request('GET', url, client=anonymous).status_code, 404)
        self.assertEqual(self.request('GET', '/media/people/' + 'a' * 32 + '.webp').status_code, 404)

    def test_every_role_is_draft_only_and_only_primo_can_approve_entire_bundle(self):
        before = self.content_state()
        editor_token = self.login().json['csrfToken']
        people = self.request('GET', '/api/admin/people').json
        people['content']['en']['members'][0]['researchDirection'] = 'New approved research'
        saved = self.request('PUT', '/api/admin/people', token=editor_token,
                             json={'revision': people['revision'], 'content': people['content']})
        news = self.request('PUT', '/api/admin/news', token=editor_token,
                            json={'revision': saved.json['revision'], 'posts': [post('new-visible', True)]})
        self.assertEqual(news.status_code, 200, news.json)
        submitted = self.request('POST', '/api/admin/review/submit', token=editor_token,
                                 json={'revision': news.json['revision']})
        self.assertEqual(submitted.status_code, 200, submitted.json)
        revision = submitted.json['revision']
        self.assertEqual(self.content_state(), before)
        self.assert_forbidden(self.request('POST', '/api/admin/review/approve', token=editor_token, json={'revision': revision}))
        admin_token = self.login('administrator').json['csrfToken']
        self.assertFalse(self.request('GET', '/api/admin/session').json['user']['canReview'])
        self.assert_forbidden(self.request('POST', '/api/admin/review/approve', token=admin_token, json={'revision': revision}))
        self.assert_forbidden(self.request('POST', '/api/admin/review/reject', token=admin_token, json={'revision': revision, 'reason': 'No'}))
        self.assertEqual(self.content_state(), before)
        owner_token = self.login('primo').json['csrfToken']
        self.assertTrue(self.request('GET', '/api/admin/session').json['user']['canReview'])
        approved = self.request('POST', '/api/admin/review/approve', token=owner_token, json={'revision': revision})
        self.assertEqual(approved.status_code, 200, approved.json)
        self.assertEqual(approved.json['workflow']['status'], 'published')
        self.assertEqual(self.request('GET', '/api/news').json['posts'], [post('new-visible', True)])
        self.assertEqual(self.request('GET', '/api/people').json['content'], people['content'])
        self.assertEqual(self.db.execute('SELECT count(*) FROM news_history').fetchone()[0], 2)
        self.assertEqual(self.db.execute('SELECT count(*) FROM content_history').fetchone()[0], 2)
        self.assertEqual(self.db.execute("SELECT count(*) FROM audit WHERE action='review_approve'").fetchone()[0], 1)

    def test_editing_deleting_withdrawing_and_reordering_published_news_stays_private(self):
        initial = self.seed_news()
        baseline = self.content_state()
        token = self.login().json['csrfToken']
        changes = [post('new-visible', True), post('published', False)]
        changes[1]['body']['en'] = 'Changed public article'
        saved = self.request('PUT', '/api/admin/news', token=token,
                             json={'revision': initial['revision'], 'posts': changes})
        self.assertEqual(saved.status_code, 200, saved.json)
        deleted = self.request('PUT', '/api/admin/news', token=token,
                               json={'revision': saved.json['revision'], 'posts': []})
        self.assertEqual(deleted.status_code, 200, deleted.json)
        self.assertEqual(self.content_state(), baseline)
        self.assertEqual(self.request('GET', '/api/news').json['posts'], [post('published', True)])

    def test_shared_revision_blocks_stale_save_and_approval_after_new_edit(self):
        token = self.login().json['csrfToken']
        saved = self.request('PUT', '/api/admin/news', token=token, json={'revision': 1, 'posts': [post('draft')]})
        people = self.request('GET', '/api/admin/people').json
        self.assertEqual(self.request('PUT', '/api/admin/people', token=token,
                                     json={'revision': 1, 'content': people['content']}).status_code, 409)
        submitted = self.request('POST', '/api/admin/review/submit', token=token, json={'revision': saved.json['revision']})
        edited = self.request('PUT', '/api/admin/people', token=token,
                              json={'revision': submitted.json['revision'], 'content': people['content']})
        self.assertEqual(edited.json['workflow']['status'], 'draft')
        owner_token = self.login('primo').json['csrfToken']
        for revision in (submitted.json['revision'], edited.json['revision']):
            self.assertEqual(self.request('POST', '/api/admin/review/approve', token=owner_token,
                                          json={'revision': revision}).status_code, 409)
        self.assertEqual(self.request('GET', '/api/news').json['posts'], [])

    def test_returned_draft_preserves_edits_and_requires_new_submission(self):
        token = self.login().json['csrfToken']
        saved = self.request('PUT', '/api/admin/news', token=token, json={'revision': 1, 'posts': [post('draft', True)]})
        submitted = self.request('POST', '/api/admin/review/submit', token=token, json={'revision': saved.json['revision']})
        owner_token = self.login('primo').json['csrfToken']
        returned = self.request('POST', '/api/admin/review/reject', token=owner_token,
                                json={'revision': submitted.json['revision'], 'reason': 'Please revise the cover'})
        self.assertEqual(returned.status_code, 200, returned.json)
        self.assertEqual(returned.json['workflow']['reason'], 'Please revise the cover')
        self.assertEqual(returned.json['posts'], [post('draft', True)])
        self.assertEqual(self.request('GET', '/api/news').json['posts'], [])
        self.assertEqual(self.request('POST', '/api/admin/review/approve', token=owner_token,
                                      json={'revision': returned.json['revision']}).status_code, 409)
        resubmitted = self.request('POST', '/api/admin/review/submit', token=owner_token,
                                   json={'revision': returned.json['revision']})
        self.assertEqual(resubmitted.status_code, 200, resubmitted.json)

    def test_approval_refuses_changed_live_base_and_rolls_back_both_sections(self):
        token = self.login('primo').json['csrfToken']
        saved = self.request('PUT', '/api/admin/news', token=token, json={'revision': 1, 'posts': [post('new', True)]})
        submitted = self.request('POST', '/api/admin/review/submit', token=token, json={'revision': saved.json['revision']})
        self.db.execute('UPDATE people SET revision=revision+1')
        baseline = self.content_state()
        denied = self.request('POST', '/api/admin/review/approve', token=token, json={'revision': submitted.json['revision']})
        self.assertEqual(denied.status_code, 409, denied.json)
        self.assertEqual(self.content_state(), baseline)
        self.db.execute('UPDATE people SET revision=revision-1')
        baseline = self.content_state()
        self.db.execute("CREATE TRIGGER fail_news_history BEFORE INSERT ON news_history BEGIN SELECT RAISE(ABORT,'simulated storage failure'); END")
        with self.assertRaises(sqlite3.IntegrityError):
            self.request('POST', '/api/admin/review/approve', token=token, json={'revision': submitted.json['revision']})
        self.assertEqual(self.content_state(), baseline)
        self.assertEqual(self.request('GET', '/api/admin/review').json['workflow']['status'], 'submitted')

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

    def test_reviewer_demotion_or_session_revocation_blocks_approval(self):
        token = self.login('primo').json['csrfToken']
        saved = self.request('PUT', '/api/admin/news', token=token, json={'revision': 1, 'posts': [post('new', True)]})
        submitted = self.request('POST', '/api/admin/review/submit', token=token, json={'revision': saved.json['revision']})
        baseline = self.content_state()
        self.db.execute("UPDATE users SET role='editor' WHERE username='primo'")
        self.assertFalse(self.request('GET', '/api/admin/session').json['user']['canReview'])
        self.assert_forbidden(self.request('POST', '/api/admin/review/approve', token=token, json={'revision': submitted.json['revision']}))
        self.db.execute('DELETE FROM sessions')
        self.assertEqual(self.request('POST', '/api/admin/review/approve', token=token, json={'revision': submitted.json['revision']}).status_code, 401)
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
