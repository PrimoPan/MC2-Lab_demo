"""A loopback HTTP smoke test using an isolated temporary database and cookies."""
import copy
import http.cookiejar
import json
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import HTTPCookieProcessor, Request, build_opener

from werkzeug.security import generate_password_hash
from werkzeug.serving import WSGIRequestHandler, make_server

from server.app import PASSWORD_METHOD, connect, create_app, initialize

ROOT = Path(__file__).resolve().parents[2]
SEED = ROOT / 'seed-people.json'
if not SEED.exists():
    SEED = ROOT / 'src/data/peopleContent.generated.json'
PASSWORD = 'Disposable HTTP test password 2026!'


class QuietHandler(WSGIRequestHandler):
    def log_request(self, *args, **kwargs):
        pass


class HttpWorkflowTest(unittest.TestCase):
    def test_real_http_editor_submission_and_owner_approval(self):
        with tempfile.TemporaryDirectory() as folder:
            initialize(folder, SEED)
            db = connect(Path(folder) / 'admin.sqlite3')
            hashed = generate_password_hash(PASSWORD, method=PASSWORD_METHOD)
            for username, role in [('jeannie', 'editor'), ('primo', 'admin'), ('another-admin', 'admin')]:
                db.execute('INSERT INTO users(username,password_hash,must_change,created_at,role) VALUES(?,?,0,0,?)',
                           (username, hashed, role))
            db.close()
            app = create_app({'TESTING': True, 'DATA_DIR': folder, 'COOKIE_SECURE': False,
                              'ORIGIN': 'http://127.0.0.1', 'TRUSTED_HOSTS': ['127.0.0.1']})
            server = make_server('127.0.0.1', 0, app, request_handler=QuietHandler)
            origin = f'http://127.0.0.1:{server.server_port}'
            app.config['ORIGIN'] = origin
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                def client():
                    return build_opener(HTTPCookieProcessor(http.cookiejar.CookieJar()))

                def call(agent, method, path, body=None, token=None):
                    headers = {'Origin': origin, 'Accept': 'application/json'}
                    if token:
                        headers['X-CSRF-Token'] = token
                    if body is not None:
                        headers['Content-Type'] = 'application/json'
                    request = Request(origin + path, method=method, headers=headers,
                                      data=None if body is None else json.dumps(body).encode())
                    try:
                        response = agent.open(request, timeout=5)
                    except HTTPError as error:
                        response = error
                    with response:
                        return response.status, json.load(response)

                anonymous, editor, owner, other = client(), client(), client(), client()
                before = call(anonymous, 'GET', '/api/people')[1]
                self.assertEqual(call(anonymous, 'GET', '/api/admin/review')[0], 401)
                status, login = call(editor, 'POST', '/api/admin/login', {'username': 'Jeannie', 'password': PASSWORD})
                self.assertEqual(status, 200)
                self.assertFalse(login['user']['canReview'])
                token = login['csrfToken']
                status, draft = call(editor, 'GET', '/api/admin/people')
                self.assertEqual(status, 200)
                content = copy.deepcopy(draft['content'])
                content['en']['members'][0]['researchDirection'] = 'HTTP-only draft test'
                payload = {'revision': draft['revision'], 'content': content}
                self.assertEqual(call(editor, 'PUT', '/api/admin/people', payload)[0], 403)
                status, saved = call(editor, 'PUT', '/api/admin/people', payload, token)
                self.assertEqual(status, 200)
                self.assertEqual(call(anonymous, 'GET', '/api/people')[1], before)
                status, submitted = call(editor, 'POST', '/api/admin/review/submit', {'revision': saved['revision']}, token)
                self.assertEqual(status, 200)
                revision = submitted['revision']
                self.assertEqual(call(editor, 'POST', '/api/admin/review/approve', {'revision': revision}, token)[0], 403)
                status, login = call(other, 'POST', '/api/admin/login', {'username': 'another-admin', 'password': PASSWORD})
                self.assertEqual(status, 200)
                self.assertEqual(call(other, 'POST', '/api/admin/review/approve', {'revision': revision}, login['csrfToken'])[0], 403)
                self.assertEqual(call(anonymous, 'GET', '/api/people')[1], before)
                status, login = call(owner, 'POST', '/api/admin/login', {'username': 'primo', 'password': PASSWORD})
                self.assertEqual(status, 200)
                self.assertTrue(login['user']['canReview'])
                status, approved = call(owner, 'POST', '/api/admin/review/approve', {'revision': revision}, login['csrfToken'])
                self.assertEqual(status, 200)
                self.assertEqual(approved['workflow']['status'], 'published')
                self.assertEqual(call(anonymous, 'GET', '/api/people')[1]['content'], content)
                self.assertEqual(call(owner, 'POST', '/api/admin/review/approve', {'revision': revision}, login['csrfToken'])[0], 409)
            finally:
                server.shutdown()
                thread.join(timeout=5)
                server.server_close()
