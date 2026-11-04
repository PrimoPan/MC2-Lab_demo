"""Local operator commands; passwords are accepted only through standard input."""
import argparse
import json
import os
from pathlib import Path
import sqlite3
import sys
import time
import uuid

from werkzeug.security import generate_password_hash

from server.app import PASSWORD_METHOD, ROLES, USERNAME, connect, initialize, validate_password


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', default=os.environ.get('MC2_DATA_DIR', '/var/lib/mc2-admin'))
    sub = parser.add_subparsers(dest='command', required=True)
    init = sub.add_parser('init')
    init.add_argument('--seed', required=True)
    for command in ('create-user', 'reset-password'):
        action = sub.add_parser(command)
        action.add_argument('username')
        action.add_argument('--password-stdin', action='store_true', required=True)
        if command == 'create-user':
            action.add_argument('--role', choices=ROLES, default='admin')
    role = sub.add_parser('set-role')
    role.add_argument('username')
    role.add_argument('role', choices=ROLES)
    disable = sub.add_parser('disable-user')
    disable.add_argument('username')
    sub.add_parser('list-users')
    sub.add_parser('backup')
    args = parser.parse_args()
    os.umask(0o077)
    if args.command == 'init':
        initialize(args.data_dir, args.seed)
        print('Persistent database initialized; existing content preserved.')
        return
    db_path = Path(args.data_dir) / 'admin.sqlite3'
    if not db_path.is_file():
        parser.error('Initialize the database first')
    db = connect(db_path)
    try:
        if args.command == 'backup':
            destination = Path(args.data_dir) / 'backups' / f"admin-{time.strftime('%Y%m%dT%H%M%SZ',time.gmtime())}-{uuid.uuid4().hex[:8]}.sqlite3"
            destination.parent.mkdir(mode=0o700, exist_ok=True)
            target = sqlite3.connect(destination)
            try:
                db.backup(target)
            finally:
                target.close()
            destination.chmod(0o600)
            print(destination)
            return
        if args.command == 'list-users':
            for row in db.execute('SELECT username,role,must_change,enabled FROM users ORDER BY username'):
                print(json.dumps(dict(row)))
            return
        if not USERNAME.fullmatch(args.username):
            parser.error('Username must be 3–64 letters, numbers, dots, underscores or hyphens')
        username = args.username.lower()
        hashed = None
        if args.command in ('create-user', 'reset-password'):
            if sys.stdin.isatty():
                parser.error('Pass the password using a pipe; never put it in command arguments')
            password = sys.stdin.read(1024)
            if password.endswith('\n'):
                password = password[:-1]
            validate_password(password)
            hashed = generate_password_hash(password, method=PASSWORD_METHOD)
            del password
        db.execute('BEGIN IMMEDIATE')
        if args.command == 'create-user':
            if db.execute('SELECT 1 FROM users WHERE username=?', (username,)).fetchone():
                parser.error('User already exists; no password was changed')
            db.execute('INSERT INTO users(username,password_hash,created_at,role) VALUES(?,?,?,?)',
                       (username, hashed, int(time.time()), args.role))
            user = db.execute('SELECT id FROM users WHERE username=?', (username,)).fetchone()
        else:
            user = db.execute('SELECT id FROM users WHERE username=?', (username,)).fetchone()
            if user is None:
                parser.error('Unknown user')
            if args.command == 'reset-password':
                db.execute('UPDATE users SET password_hash=?,must_change=1 WHERE id=?', (hashed, user['id']))
            elif args.command == 'set-role':
                db.execute('UPDATE users SET role=? WHERE id=?', (args.role, user['id']))
            else:
                db.execute('UPDATE users SET enabled=0 WHERE id=?', (user['id'],))
            db.execute('DELETE FROM sessions WHERE user_id=?', (user['id'],))
        db.execute('INSERT INTO audit(created_at,user_id,action,detail) VALUES(?,?,?,?)',
                   (int(time.time()), user['id'], args.command,
                    'operator CLI role=' + args.role if args.command in ('create-user', 'set-role') else 'operator CLI'))
        db.commit()
        print('Account operation completed. Passwords are never printed.')
    finally:
        db.close()


if __name__ == '__main__':
    main()
