import copy
import io
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest
import subprocess
import sys
from unittest.mock import patch

from PIL import Image
from werkzeug.security import generate_password_hash, check_password_hash

from server.app import PASSWORD_METHOD, connect, create_app, initialize
from server.validation import validate_content, validate_posts

ORIGIN = 'https://mc2.example.test'
OLD_PASSWORD = 'Initial secret for local tests 2026!'
NEW_PASSWORD = 'Changed secret for local tests 2026!'
SEED = Path(__file__).resolve().parents[2] / 'seed-people.json'
if not SEED.exists():
    SEED = Path(__file__).resolve().parents[2] / 'src/data/peopleContent.generated.json'
# In the repository, parents[2] is server's parent, i.e. the repository root.
if not SEED.exists():
    SEED = Path(__file__).resolve().parents[2].parent / 'src/data/peopleContent.generated.json'


class ApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.password_hash = generate_password_hash(OLD_PASSWORD, method=PASSWORD_METHOD)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.data_dir = Path(self.temp.name)
        initialize(self.data_dir, SEED)
        self.app = create_app({'TESTING': True, 'DATA_DIR': self.temp.name, 'ORIGIN': ORIGIN,
                               'TRUSTED_HOSTS': ['mc2.example.test'], 'COOKIE_SECURE': True})
        self.client = self.app.test_client()
        self.db = connect(self.data_dir / 'admin.sqlite3')
        self.addCleanup(self.db.close)
        self.db.execute('INSERT INTO users(username,password_hash,created_at) VALUES(?,?,0)', ('primo', self.password_hash))

    def request(self, method, path, *, client=None, token=None, origin=ORIGIN, **kwargs):
        headers = kwargs.pop('headers', {})
        if origin is not None:
            headers['Origin'] = origin
        if token is not None:
            headers['X-CSRF-Token'] = token
        response = (client or self.client).open(path, method=method, base_url=ORIGIN, headers=headers, **kwargs)
        # Test-client multipart bodies can use temporary files even for in-memory data.
        response.request.environ['wsgi.input'].close()
        return response

    def login(self, client=None):
        response = self.request('POST', '/api/admin/login', client=client,
                                json={'username': 'primo', 'password': OLD_PASSWORD})
        self.assertEqual(response.status_code, 200)
        return response

    def authorized(self):
        token = self.login().json['csrfToken']
        response = self.request('POST', '/api/admin/password', token=token,
                                json={'currentPassword': OLD_PASSWORD, 'newPassword': NEW_PASSWORD})
        self.assertEqual(response.status_code, 200)
        return response.json['csrfToken']

    def test_seed_preserved_across_reinitialization(self):
        content = self.request('GET', '/api/people').json['content']
        self.assertEqual(content, json.loads(SEED.read_text()))
        self.assertEqual(len(content['en']['members']), 54)
        self.db.execute('UPDATE people SET revision=9 WHERE id=1')
        initialize(self.data_dir, SEED)
        self.assertEqual(self.request('GET', '/api/people').json['revision'], 9)

    def test_origin_and_csrf_and_forced_password(self):
        payload = self.request('GET', '/api/people').json
        self.assertEqual(self.request('PUT', '/api/admin/people', json=payload).status_code, 401)
        self.assertEqual(self.request('POST', '/api/admin/login', origin='https://evil.test', json={}).status_code, 403)
        self.assertEqual(self.request('POST', '/api/admin/login', origin=None, json={}).status_code, 403)
        response = self.login()
        cookie = response.headers['Set-Cookie']
        self.assertIn('Secure', cookie)
        self.assertIn('HttpOnly', cookie)
        self.assertIn('SameSite=Strict', cookie)
        self.assertNotIn('Domain=', cookie)
        self.assertEqual(self.request('PUT', '/api/admin/people', json=payload).status_code, 403)
        blocked = self.request('PUT', '/api/admin/people', token=response.json['csrfToken'], json=payload)
        self.assertTrue(blocked.json['requirePasswordChange'])
        self.assertEqual(self.request('GET', '/api/admin/news').status_code, 403)

    def test_password_change_rotates_and_revokes_sessions(self):
        second = self.app.test_client()
        old = self.login().json['csrfToken']
        self.login(second)
        response = self.request('POST', '/api/admin/password', token=old,
                                json={'currentPassword': OLD_PASSWORD, 'newPassword': NEW_PASSWORD})
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(old, response.json['csrfToken'])
        self.assertFalse(response.json['user']['mustChangePassword'])
        self.assertEqual(self.request('GET', '/api/admin/session', client=second).status_code, 401)
        rejected = self.request('POST', '/api/admin/logout', token=old)
        self.assertEqual(rejected.status_code, 403)
        self.assertNotIn('Clear-Site-Data', rejected.headers)
        self.assertNotIn('Clear-Site-Data', self.request('GET', '/api/people').headers)
        logged_out = self.request('POST', '/api/admin/logout', token=response.json['csrfToken'])
        self.assertEqual(logged_out.status_code, 200)
        self.assertEqual(logged_out.headers['Clear-Site-Data'], '"cache", "storage"')
        self.assertIn('Max-Age=0', logged_out.headers['Set-Cookie'])
        self.assertNotIn('Domain=', logged_out.headers['Set-Cookie'])
        self.assertEqual(self.request('GET', '/api/admin/session').status_code, 401)

    def test_login_rate_limit_persists_across_workers(self):
        for _ in range(8):
            result = self.request('POST', '/api/admin/login', json={'username':'primo','password':'wrong'})
            self.assertEqual(result.status_code, 401)
        another = self.app.test_client()
        result = self.request('POST', '/api/admin/login', client=another, json={'username':'primo','password':OLD_PASSWORD})
        self.assertEqual(result.status_code, 429)
        self.assertEqual(result.headers['Retry-After'], '900')

    def test_concurrent_password_reset_cannot_issue_stale_login_session(self):
        replacement = generate_password_hash(NEW_PASSWORD, method=PASSWORD_METHOD)
        def verify_then_reset(hashed, submitted):
            valid = check_password_hash(hashed, submitted)
            self.db.execute("UPDATE users SET password_hash=? WHERE username='primo'", (replacement,))
            self.db.execute('DELETE FROM sessions')
            return valid
        with patch('server.app.check_password_hash', side_effect=verify_then_reset):
            response = self.request('POST', '/api/admin/login', json={'username':'primo','password':OLD_PASSWORD})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(self.db.execute('SELECT count(*) FROM sessions').fetchone()[0], 0)

    def test_revoked_session_cannot_finish_queued_content_write(self):
        for endpoint, validator_name, validator in [('people','validate_content',validate_content), ('news','validate_posts',validate_posts)]:
            if endpoint == 'people':
                token = self.authorized()
                payload = self.request('GET', '/api/people').json
            else:
                token = self.request('POST', '/api/admin/login', json={'username':'primo','password':NEW_PASSWORD}).json['csrfToken']
                payload = {'revision':1,'posts':[self.post()]}
            def validate_then_revoke(content):
                result = validator(content)
                self.db.execute('DELETE FROM sessions')
                return result
            with patch('server.app.' + validator_name, side_effect=validate_then_revoke):
                result = self.request('PUT', '/api/admin/' + endpoint, token=token, json=payload)
            self.assertEqual(result.status_code, 401)
            self.assertEqual(self.request('GET', '/api/' + endpoint).json['revision'], 1)

    def test_member_save_conflict_and_atomic_history(self):
        token = self.authorized()
        payload = self.request('GET', '/api/people').json
        payload['content']['en']['members'][0]['researchDirection'] = 'New local test text'
        saved = self.request('PUT', '/api/admin/people', token=token, json=payload)
        self.assertEqual(saved.status_code, 200)
        self.assertEqual(saved.json['revision'], 2)
        self.assertEqual(self.request('PUT', '/api/admin/people', token=token, json=payload).status_code, 409)
        self.assertEqual(self.db.execute('SELECT count(*) FROM content_history').fetchone()[0], 2)
        self.assertEqual(self.db.execute("SELECT count(*) FROM audit WHERE action='people_saved'").fetchone()[0], 1)

    def test_reject_invalid_members_without_mutation(self):
        token = self.authorized()
        baseline = self.request('GET', '/api/people').json
        for mutation in ['javascript', 'mismatch', 'duplicate', 'badtype', 'alumni_count', 'unknown']:
            payload = copy.deepcopy(baseline)
            en = payload['content']['en']
            if mutation == 'javascript': en['members'][0]['website'] = 'javascript:alert(1)'
            if mutation == 'mismatch': en['members'][0]['role'] = 'ra'
            if mutation == 'duplicate': en['members'][1]['key'] = en['members'][0]['key']
            if mutation == 'badtype': en['members'][0]['role'] = []
            if mutation == 'alumni_count': en['alumniGroups'][0]['entries'].pop()
            if mutation == 'unknown': en['members'][0]['permissions'] = ['administrator']
            with self.subTest(mutation=mutation):
                result = self.request('PUT', '/api/admin/people', token=token, json=payload)
                self.assertEqual(result.status_code, 400, result.json)
                self.assertEqual(self.request('GET', '/api/people').json, baseline)

    def post(self, published=False):
        return {'id':'local-test-id', 'slug':'local-test-news', 'date':'2026-10-26',
                'title':{'en':'Local test', 'zh-CN':''}, 'summary':{'en':'Summary', 'zh-CN':''},
                'body':{'en':'Plain <script> text is not HTML', 'zh-CN':''}, 'image':'', 'published':published}

    def test_news_drafts_not_public_and_conflict_and_slug(self):
        token = self.authorized()
        post = self.post()
        result = self.request('PUT', '/api/admin/news', token=token, json={'revision':1,'posts':[post]})
        self.assertEqual(result.status_code, 200)
        self.assertEqual(self.request('GET', '/api/news').json['posts'], [])
        self.assertEqual(len(self.request('GET', '/api/admin/news').json['posts']), 1)
        self.assertEqual(self.request('PUT', '/api/admin/news', token=token, json={'revision':1,'posts':[post]}).status_code, 409)
        post['slug'] = 'changed-slug'
        self.assertEqual(self.request('PUT', '/api/admin/news', token=token, json={'revision':2,'posts':[post]}).status_code, 400)
        post['slug'] = 'local-test-news'
        post['published'] = True
        self.assertEqual(self.request('PUT', '/api/admin/news', token=token, json={'revision':2,'posts':[post]}).status_code, 200)
        self.assertEqual(self.request('GET', '/api/news').json['posts'][0]['title']['en'], 'Local test')
        self.assertEqual(self.db.execute('SELECT count(*) FROM news_history').fetchone()[0], 3)

    def test_photo_reencoded_and_limits(self):
        token = self.authorized()
        image = io.BytesIO()
        Image.new('RGB', (40,30), 'red').save(image, format='PNG')
        image.seek(0)
        result = self.request('POST', '/api/admin/photos', token=token,
                              data={'file':(image,'../../evil.html')})
        self.assertEqual(result.status_code, 201, result.json)
        self.assertRegex(result.json['url'], r'^/media/people/[a-f0-9]{32}\.webp$')
        photo = self.request('GET', result.json['url'])
        self.assertEqual(photo.mimetype, 'image/webp')
        self.assertEqual(Image.open(io.BytesIO(photo.data)).size, (40,30))
        photo.close()
        self.assertEqual(self.request('POST', '/api/admin/photos', token=token,
                                      data={'file':(io.BytesIO(b'<svg onload="alert(1)"/>'),'evil.svg')}).status_code, 400)
        self.assertEqual(self.request('POST', '/api/admin/photos', token=token,
                                      data={'file':(io.BytesIO(b'x'*(5*1024*1024+1)),'huge.png')}).status_code, 413)
        self.assertEqual(self.request('GET', '/media/people/admin.sqlite3').status_code, 404)

    def test_realistic_photo_over_multipart_buffer_size(self):
        token = self.authorized()
        photo = Image.frombytes('RGB', (800,600), os.urandom(800*600*3))
        output = io.BytesIO()
        photo.save(output, format='JPEG', quality=92)
        self.assertGreater(output.tell(), 100_000)
        output.seek(0)
        result = self.request('POST', '/api/admin/photos', token=token, data={'file':(output,'photo.jpg')})
        self.assertEqual(result.status_code, 201, result.json)

    def test_cli_password_stdin_and_consistent_backup(self):
        command = [sys.executable, '-m', 'server.cli', '--data-dir', self.temp.name]
        created = subprocess.run(command + ['create-user', 'secretary', '--password-stdin'],
                                 input=OLD_PASSWORD+'\n', text=True, capture_output=True)
        self.assertEqual(created.returncode, 0, created.stderr)
        self.assertNotIn(OLD_PASSWORD, created.stdout + created.stderr)
        self.assertEqual(self.db.execute("SELECT must_change FROM users WHERE username='secretary'").fetchone()[0], 1)
        saved = subprocess.run(command + ['backup'], text=True, capture_output=True, check=True)
        path = Path(saved.stdout.strip())
        self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        snapshot = sqlite3.connect(path)
        try:
            self.assertEqual(snapshot.execute('PRAGMA integrity_check').fetchone()[0], 'ok')
            self.assertEqual(snapshot.execute('SELECT count(*) FROM users').fetchone()[0], 2)
        finally:
            snapshot.close()


if __name__ == '__main__':
    unittest.main()
