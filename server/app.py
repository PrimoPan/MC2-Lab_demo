"""Small same-origin API with server-side sessions and persistent content history."""
import hashlib
import io
import json
import os
from pathlib import Path
import re
import secrets
import sqlite3
import time
import uuid
import warnings
from functools import wraps
from urllib.parse import urlsplit

from flask import Flask, g, jsonify, request, send_from_directory
from PIL import Image, ImageOps, UnidentifiedImageError
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash

from server.validation import ValidationError, validate_content, validate_posts

PHOTO_LIMIT = 5 * 1024 * 1024
SESSION_TTL = 8 * 60 * 60
PASSWORD_METHOD = 'scrypt:32768:8:1'
USERNAME = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,63}$')
ROLES = ('admin', 'editor')
SCHEMA = '''
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL COLLATE NOCASE,
 password_hash TEXT NOT NULL, must_change INTEGER NOT NULL DEFAULT 1,
 enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL,
 role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('admin','editor')));
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
 csrf TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS people (
 id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, content TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS content_history (
 revision INTEGER PRIMARY KEY, content TEXT NOT NULL, user_id INTEGER, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit (
 id INTEGER PRIMARY KEY, created_at INTEGER NOT NULL, user_id INTEGER,
 action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS attempts (
 id INTEGER PRIMARY KEY, username TEXT NOT NULL, address TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS attempts_time ON attempts(created_at);
CREATE TABLE IF NOT EXISTS uploads (
 filename TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS news (
 id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, posts TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS news_history (
 revision INTEGER PRIMARY KEY, posts TEXT NOT NULL, user_id INTEGER, created_at INTEGER NOT NULL);
'''


def connect(path):
    db = sqlite3.connect(path, timeout=10, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    db.execute('PRAGMA busy_timeout=10000')
    return db


def initialize(data_dir, seed_path):
    """Idempotent migration: a later deployment must never reimport over live edits."""
    data_dir = Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True, mode=0o750)
    (data_dir / 'photos').mkdir(exist_ok=True, mode=0o750)
    (data_dir / 'backups').mkdir(exist_ok=True, mode=0o700)
    path = data_dir / 'admin.sqlite3'
    db = connect(path)
    db.execute('PRAGMA journal_mode=WAL')
    db.executescript(SCHEMA)
    try:
        db.execute('BEGIN IMMEDIATE')
        # Existing accounts already had administrator privileges. Preserve them
        # during the additive migration; new limited accounts opt into editor.
        if 'role' not in {row['name'] for row in db.execute('PRAGMA table_info(users)')}:
            db.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('admin','editor'))")
        if db.execute('SELECT 1 FROM people').fetchone() is None:
            content = validate_content(json.loads(Path(seed_path).read_text()))
            raw = json.dumps(content, ensure_ascii=False, separators=(',', ':'))
            db.execute('INSERT INTO people VALUES (1, 1, ?)', (raw,))
            db.execute('INSERT INTO content_history VALUES (1, ?, NULL, ?)', (raw, int(time.time())))
        if db.execute('SELECT 1 FROM news').fetchone() is None:
            db.execute("INSERT INTO news VALUES(1,1,'[]')")
            db.execute("INSERT INTO news_history VALUES(1,'[]',NULL,?)", (int(time.time()),))
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
    path.chmod(0o600)


def validate_password(value):
    if not isinstance(value, str) or not 14 <= len(value) <= 128 or not value.strip():
        raise ValidationError('Password must contain 14–128 characters')
    if any(ord(c) < 32 for c in value):
        raise ValidationError('Password must not contain control characters')


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def create_app(config=None):
    app = Flask(__name__)
    origin = os.environ.get('MC2_ORIGIN', 'https://mc2.hkust-gz.edu.cn')
    app.config.update(
        DATA_DIR=os.environ.get('MC2_DATA_DIR', '/var/lib/mc2-admin'),
        ORIGIN=origin,
        TRUSTED_HOSTS=[urlsplit(origin).hostname],
        COOKIE_SECURE=True,
        TRUST_LOCAL_PROXY=os.environ.get('MC2_TRUST_LOCAL_PROXY') == '1',
        MAX_CONTENT_LENGTH=PHOTO_LIMIT + 128 * 1024,
        MAX_FORM_MEMORY_SIZE=128 * 1024,
        MAX_FORM_PARTS=3,
        TESTING=False,
    )
    if config:
        app.config.update(config)
    if not app.config['TESTING'] and not app.config['COOKIE_SECURE']:
        raise RuntimeError('Production requires secure cookies')
    if not app.config['TESTING'] and not app.config['ORIGIN'].startswith('https://'):
        raise RuntimeError('Production requires an HTTPS origin')
    app.config['COOKIE_NAME'] = '__Host-mc2_admin' if app.config['COOKIE_SECURE'] else 'mc2_admin_test'
    # No Flask signed session is used: random bearer IDs are hashed in SQLite.
    app.config['DATABASE'] = str(Path(app.config['DATA_DIR']) / 'admin.sqlite3')
    dummy_hash = generate_password_hash(secrets.token_urlsafe(32), method=PASSWORD_METHOD)

    def db():
        if 'db' not in g:
            g.db = connect(app.config['DATABASE'])
        return g.db

    @app.teardown_appcontext
    def close_db(_error):
        connection = g.pop('db', None)
        if connection is not None:
            connection.close()

    def error(message, status, **extra):
        return jsonify(error=message, **extra), status

    def audit(action, user_id=None, detail=''):
        db().execute('INSERT INTO audit(created_at,user_id,action,detail) VALUES(?,?,?,?)',
                     (int(time.time()), user_id, action, detail))

    def json_body():
        if not request.is_json:
            raise ValidationError('Content-Type must be application/json')
        data = request.get_json()
        if not isinstance(data, dict):
            raise ValidationError('JSON body must be an object')
        return data

    def same_origin():
        return request.headers.get('Origin') == app.config['ORIGIN']

    def remote_address():
        if app.config['TRUST_LOCAL_PROXY'] and request.remote_addr in ('127.0.0.1', '::1'):
            # Nginx MUST overwrite X-Real-IP, never append an untrusted value.
            return request.headers.get('X-Real-IP', request.remote_addr)[:80]
        return (request.remote_addr or 'unknown')[:80]

    def user_session():
        token = request.cookies.get(app.config['COOKIE_NAME'], '')
        if len(token) > 100 or not token:
            return None
        return db().execute('''SELECT s.token_hash,s.csrf,s.expires_at,u.id,u.username,u.must_change,u.role
            FROM sessions s JOIN users u ON s.user_id=u.id
            WHERE s.token_hash=? AND s.expires_at>? AND u.enabled=1''',
            (digest(token), int(time.time()))).fetchone()

    def require_auth(allow_password_change=False, roles=ROLES):
        def decorate(handler):
            @wraps(handler)
            def wrapped(*args, **kwargs):
                row = user_session()
                if row is None:
                    return error('Authentication required', 401)
                g.user = row
                if request.method not in ('GET', 'HEAD', 'OPTIONS'):
                    supplied = request.headers.get('X-CSRF-Token', '')
                    if not same_origin() or not secrets.compare_digest(supplied.encode(), row['csrf'].encode()):
                        return error('Invalid origin or CSRF token', 403)
                if row['must_change'] and not allow_password_change:
                    return error('Change the initial password before editing', 403, requirePasswordChange=True)
                if row['role'] not in roles:
                    return error('This account does not have permission for this action', 403, code='insufficientPermission')
                return handler(*args, **kwargs)
            return wrapped
        return decorate

    def session_response(user, rotate_all=False):
        connection = db()
        if rotate_all:
            connection.execute('DELETE FROM sessions WHERE user_id=?', (user['id'],))
        else:
            old = request.cookies.get(app.config['COOKIE_NAME'], '')
            connection.execute('DELETE FROM sessions WHERE token_hash=?', (digest(old),))
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        connection.execute('INSERT INTO sessions VALUES (?,?,?,?)',
                           (digest(token), user['id'], csrf, int(time.time()) + SESSION_TTL))
        response = jsonify(user={'username': user['username'], 'mustChangePassword': bool(user['must_change']),
                                 'role': user['role']}, csrfToken=csrf)
        response.set_cookie(app.config['COOKIE_NAME'], token, max_age=SESSION_TTL,
                            secure=app.config['COOKIE_SECURE'], httponly=True, samesite='Strict', path='/')
        return response

    @app.after_request
    def response_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        if request.path.startswith('/api/admin/'):
            response.headers['Cache-Control'] = 'no-store'
        elif request.path.startswith('/api/'):
            response.headers['Cache-Control'] = 'no-cache'
        return response

    @app.errorhandler(ValidationError)
    def validation_error(exc):
        return error(str(exc), 400)

    @app.errorhandler(HTTPException)
    def http_error(exc):
        return error('Request rejected' if exc.code >= 500 else exc.name, exc.code)

    @app.errorhandler(sqlite3.OperationalError)
    def database_error(_exc):
        return error('Storage temporarily unavailable; please retry', 503)

    @app.get('/api/healthz')
    def health():
        db().execute('SELECT revision FROM people WHERE id=1').fetchone()
        return jsonify(status='ok')

    @app.get('/api/people')
    def get_people():
        row = db().execute('SELECT revision,content FROM people WHERE id=1').fetchone()
        return jsonify(revision=row['revision'], content=json.loads(row['content']))

    @app.get('/api/admin/session')
    @require_auth(allow_password_change=True)
    def get_session():
        return jsonify(user={'username': g.user['username'], 'mustChangePassword': bool(g.user['must_change']),
                             'role': g.user['role']}, csrfToken=g.user['csrf'])

    @app.get('/api/news')
    def public_news():
        row = db().execute('SELECT revision,posts FROM news WHERE id=1').fetchone()
        posts = [post for post in json.loads(row['posts']) if post['published']]
        return jsonify(revision=row['revision'], posts=posts)

    @app.get('/api/admin/news')
    @require_auth()
    def admin_news():
        row = db().execute('SELECT revision,posts FROM news WHERE id=1').fetchone()
        return jsonify(revision=row['revision'], posts=json.loads(row['posts']))

    @app.put('/api/admin/news')
    @require_auth()
    def save_news():
        data = json_body()
        if set(data) != {'revision', 'posts'} or type(data['revision']) is not int:
            raise ValidationError('revision and posts are required')
        posts = validate_posts(data['posts'])
        raw = json.dumps(posts, ensure_ascii=False, separators=(',', ':'))
        if len(raw.encode()) > 2 * 1024 * 1024:
            raise ValidationError('News document is too large')
        connection = db()
        connection.execute('BEGIN IMMEDIATE')
        try:
            active = user_session()
            if active is None or active['must_change']:
                connection.rollback()
                return error('Authentication required', 401)
            row = connection.execute('SELECT revision,posts FROM news WHERE id=1').fetchone()
            if row['revision'] != data['revision']:
                connection.rollback()
                return error('News changed in another session; reload before saving', 409, revision=row['revision'])
            previous_posts = json.loads(row['posts'])
            # Compare the complete public projection, including order. Editors
            # may alter drafts only, even when bypassing the UI with raw JSON.
            if active['role'] not in ROLES or (active['role'] == 'editor' and
                    [post for post in posts if post['published']] !=
                    [post for post in previous_posts if post['published']]):
                connection.rollback()
                return error('Only administrators can publish or change published news', 403, code='insufficientPermission')
            previous = {post['id']: post['slug'] for post in previous_posts}
            if any(post['id'] in previous and previous[post['id']] != post['slug'] for post in posts):
                raise ValidationError('The slug of a saved post cannot be changed')
            revision = row['revision'] + 1
            connection.execute('UPDATE news SET revision=?,posts=? WHERE id=1', (revision, raw))
            connection.execute('INSERT INTO news_history VALUES(?,?,?,?)', (revision, raw, g.user['id'], int(time.time())))
            audit('news_saved', g.user['id'], str(revision))
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        return jsonify(revision=revision, posts=posts)

    @app.post('/api/admin/login')
    def login():
        if not same_origin():
            return error('Invalid origin', 403)
        data = json_body()
        username, password = data.get('username', ''), data.get('password', '')
        if not isinstance(username, str) or not isinstance(password, str) or len(username) > 64 or len(password) > 128:
            return error('Invalid username or password', 401)
        username = username.strip().lower()
        now, address = int(time.time()), remote_address()
        connection = db()
        connection.execute('BEGIN IMMEDIATE')
        connection.execute('DELETE FROM attempts WHERE created_at<?', (now - 900,))
        counts = connection.execute('SELECT sum(username=?) AS by_user,sum(address=?) AS by_ip FROM attempts', (username, address)).fetchone()
        if (counts['by_user'] or 0) >= 8 or (counts['by_ip'] or 0) >= 40:
            connection.commit()
            response, status = error('Too many login attempts; try again later', 429)
            response.headers['Retry-After'] = '900'
            return response, status
        connection.execute('INSERT INTO attempts(username,address,created_at) VALUES(?,?,?)', (username, address, now))
        connection.commit()
        user = connection.execute('SELECT * FROM users WHERE username=?', (username,)).fetchone()
        valid = check_password_hash(user['password_hash'] if user else dummy_hash, password)
        if user is None or not valid or not user['enabled']:
            audit('login_failed')
            return error('Invalid username or password', 401)
        connection.execute('BEGIN IMMEDIATE')
        try:
            fresh = connection.execute('SELECT * FROM users WHERE id=?', (user['id'],)).fetchone()
            # A reset/disable can occur during the expensive password hash check.
            # Do not issue a new session from the stale, previously valid record.
            if fresh is None or not fresh['enabled'] or fresh['password_hash'] != user['password_hash']:
                connection.rollback()
                return error('Invalid username or password', 401)
            user = fresh
            response = session_response(user)
            audit('login', user['id'])
            connection.execute('DELETE FROM sessions WHERE expires_at<=?', (now,))
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        return response

    @app.post('/api/admin/logout')
    @require_auth(allow_password_change=True)
    def logout():
        db().execute('DELETE FROM sessions WHERE token_hash=?', (g.user['token_hash'],))
        audit('logout', g.user['id'])
        response = jsonify(ok=True)
        response.delete_cookie(app.config['COOKIE_NAME'], path='/', secure=app.config['COOKIE_SECURE'], httponly=True, samesite='Strict')
        # Clear only this origin's cached content/storage after authenticated
        # logout. The "cookies" directive would also log out sibling campus sites.
        response.headers['Clear-Site-Data'] = '"cache", "storage"'
        return response

    @app.post('/api/admin/password')
    @require_auth(allow_password_change=True)
    def password():
        data = json_body()
        current, new = data.get('currentPassword'), data.get('newPassword')
        validate_password(new)
        if not isinstance(current, str) or len(current) > 128:
            return error('Current password is incorrect', 400)
        user = db().execute('SELECT * FROM users WHERE id=?', (g.user['id'],)).fetchone()
        if not check_password_hash(user['password_hash'], current):
            return error('Current password is incorrect', 400)
        if secrets.compare_digest(current.encode(), new.encode()):
            return error('New password must be different', 400)
        hashed = generate_password_hash(new, method=PASSWORD_METHOD)
        connection = db()
        connection.execute('BEGIN IMMEDIATE')
        try:
            # Recheck the session within the transaction to prevent replay after concurrent reset.
            if user_session() is None:
                connection.rollback()
                return error('Authentication required', 401)
            connection.execute('UPDATE users SET password_hash=?,must_change=0 WHERE id=?', (hashed, g.user['id']))
            fresh = connection.execute('SELECT * FROM users WHERE id=?', (g.user['id'],)).fetchone()
            response = session_response(fresh, rotate_all=True)
            audit('password_changed', g.user['id'])
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        return response

    @app.put('/api/admin/people')
    @require_auth(roles=('admin',))
    def save_people():
        data = json_body()
        if set(data) != {'revision', 'content'} or type(data['revision']) is not int:
            raise ValidationError('revision and content are required')
        content = validate_content(data['content'])
        raw = json.dumps(content, ensure_ascii=False, separators=(',', ':'))
        if len(raw.encode()) > 2 * 1024 * 1024:
            raise ValidationError('Content document is too large')
        connection = db()
        connection.execute('BEGIN IMMEDIATE')
        try:
            active = user_session()
            if active is None or active['must_change']:
                connection.rollback()
                return error('Authentication required', 401)
            if active['role'] != 'admin':
                connection.rollback()
                return error('Only administrators can change published people content', 403, code='insufficientPermission')
            row = connection.execute('SELECT revision FROM people WHERE id=1').fetchone()
            if row['revision'] != data['revision']:
                connection.rollback()
                return error('Content changed in another session; reload before saving', 409, revision=row['revision'])
            revision = row['revision'] + 1
            connection.execute('UPDATE people SET revision=?,content=? WHERE id=1', (revision, raw))
            # Atomic history is the undo/recovery record for every committed change.
            connection.execute('INSERT INTO content_history VALUES(?,?,?,?)', (revision, raw, g.user['id'], int(time.time())))
            audit('people_saved', g.user['id'], str(revision))
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        return jsonify(revision=revision, content=content)

    @app.post('/api/admin/photos')
    @require_auth()
    def upload_photo():
        if set(request.files) != {'file'} or len(request.files.getlist('file')) != 1:
            raise ValidationError('Exactly one image file is required')
        now = int(time.time())
        count = db().execute('SELECT count(*) FROM uploads WHERE user_id=? AND created_at>?', (g.user['id'], now - 3600)).fetchone()[0]
        if count >= 30:
            return error('Photo upload limit reached; try again later', 429)
        payload = request.files['file'].stream.read(PHOTO_LIMIT + 1)
        if not payload or len(payload) > PHOTO_LIMIT:
            return error('Photo must be at most 5 MiB', 413)
        try:
            with warnings.catch_warnings():
                warnings.simplefilter('error', Image.DecompressionBombWarning)
                with Image.open(io.BytesIO(payload)) as original:
                    if original.format not in ('JPEG', 'PNG', 'WEBP') or getattr(original, 'is_animated', False):
                        raise ValidationError('Use a non-animated JPEG, PNG or WebP image')
                    if original.width * original.height > 20_000_000:
                        raise ValidationError('Image dimensions are too large (maximum 20 megapixels)')
                    original.load()
                    photo = ImageOps.exif_transpose(original).convert('RGB')
                    photo.thumbnail((1600, 1600))
                    # A fresh image object strips metadata, including EXIF and source paths.
                    clean = Image.new('RGB', photo.size)
                    clean.paste(photo)
                    output = io.BytesIO()
                    clean.save(output, format='WEBP', quality=88, method=4)
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
            raise ValidationError('Invalid or oversized image') from exc
        filename = uuid.uuid4().hex + '.webp'
        path = Path(app.config['DATA_DIR']) / 'photos' / filename
        connection = db()
        connection.execute('BEGIN IMMEDIATE')
        try:
            active = user_session()
            if active is None or active['must_change']:
                connection.rollback()
                return error('Authentication required', 401)
            if active['role'] not in ROLES:
                connection.rollback()
                return error('This account cannot upload images', 403, code='insufficientPermission')
            with path.open('xb') as target:
                target.write(output.getvalue())
                target.flush()
                os.fsync(target.fileno())
            path.chmod(0o640)
            connection.execute('INSERT INTO uploads VALUES(?,?,?)', (filename, active['id'], now))
            audit('photo_uploaded', active['id'], filename)
            connection.commit()
        except Exception:
            connection.rollback()
            path.unlink(missing_ok=True)
            raise
        return jsonify(url='/media/people/' + filename), 201

    @app.get('/media/people/<filename>')
    def uploaded_photo(filename):
        # Production Nginx uses the same fixed directory; this route supports local QA.
        if not re.fullmatch(r'[a-f0-9]{32}\.webp', filename):
            return error('Not found', 404)
        response = send_from_directory(Path(app.config['DATA_DIR']) / 'photos', filename, mimetype='image/webp')
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        return response

    return app
