# MC2 administration API

The public React website stays on Nginx. This Flask/Gunicorn API stores website accounts, sessions, member/alumni content, news, revision history and audit records in SQLite. Website accounts have an `admin` or `editor` role. The public member category `admin` still means an administrative lab position and grants no login rights.

This document describes the role-aware implementation. Deploying it, assigning roles to live test accounts and obtaining IT's penetration-test result are separate steps; the presence of this document does not confirm any of them.

## Runtime and data

- Python 3.12 or newer. Dependencies and their transitive packages are pinned in `requirements.txt` (checked against PyPI on 2026-10-26).
- Production: non-root `mc2admin` user, Gunicorn on `127.0.0.1:2027`, systemd unit `mc2-admin`.
- Versioned code and venv: `/opt/mc2-admin/releases/<release-id>`; `/opt/mc2-admin/current` selects the active version.
- Persistent data: `/var/lib/mc2-admin/admin.sqlite3`, `photos/`, and `backups/`. Never put these inside a frontend release.
- `/etc/mc2-admin.env` contains `MC2_DATA_DIR`, the single HTTPS `MC2_ORIGIN`, and `MC2_TRUST_LOCAL_PROXY=1`. Nginx must overwrite `X-Real-IP`; the API trusts it only on loopback when explicitly enabled. No proxy headers control authentication or cookie security.
- Nginx routes `/api/` to Gunicorn and `/media/people/` to `/var/lib/mc2-admin/photos/`. Photos are also served by a UUID-restricted Flask route for local verification. The existing campus gateway provides HTTPS; fixed Secure cookies are compatible with the private HTTP hop.

## API

| Route | Result / write body |
| --- | --- |
| `GET /api/people` | `{revision,content:{en,...,"zh-CN":...}}` |
| `GET /api/news` | `{revision,posts}` containing only published posts |
| `GET /api/admin/session` | `{user:{username,mustChangePassword,role},csrfToken}` or 401; `role` is `admin` or `editor` |
| `POST /api/admin/login` | `{username,password}`; returns the session shape |
| `POST /api/admin/password` | `{currentPassword,newPassword}`; returns a new session and invalidates all old sessions |
| `POST /api/admin/logout` | Revokes the current session |
| `PUT /api/admin/people` | Administrator only; `{revision,content}`; returns updated document and revision |
| `GET /api/admin/news` | Both roles; all posts including drafts |
| `PUT /api/admin/news` | `{revision,posts}`; editors may change only unpublished drafts; returns updated posts and revision |
| `POST /api/admin/photos` | Both roles; multipart `file`; returns `{url}` with status 201 |

Every write requires the exact configured Origin. Authenticated writes additionally require `X-CSRF-Token` from the current session. Login uses exact-Origin validation before reading credentials and persistent account/IP attempt limits. Both roles must change their initial password before reading draft news, saving content or uploading. Session lifetime is eight hours, with HttpOnly, Secure and SameSite=Strict cookies. Session IDs are random and stored only as SHA-256 hashes. Passwords use Werkzeug scrypt; new passwords must contain **14–128 Unicode characters**.

Administrators retain all content-management capabilities. Editors can read members/alumni and all news, create/edit/delete unpublished news drafts, and upload images. They cannot publish, withdraw, change, delete or reorder published news. Members and alumni are read-only for editors because saving those records immediately changes the public site. Role checks are enforced by the API, including within content-write transactions; hiding frontend controls is not the authorization boundary. A denied role operation returns 403 with `code: "insufficientPermission"`. Authentication, first-password-change and CSRF requirements still apply.

Stale revisions return 409. Validation errors return 400. The frontend must preserve unsaved work and offer a deliberate reload on conflict. People require matching bilingual keys, shared properties, role-filter structure, and corresponding alumni group lengths. Localized text remains separate; initialization preserves the original JSON exactly. Member keys are public anchors and should remain stable when names change.

News fields are `id`, `slug`, `date`, `title`, `summary`, `body`, `image`, `published`. `title`, `summary`, and `body` each have `en` and `zh-CN` strings. English title/body are required; summaries and Chinese strings may be empty. Text limits are 200/1000/50000 characters. Body is plain text and must be rendered as text paragraphs, never as HTML. Saved slugs are immutable. News is separate from the existing static news archive.

Images must be JPEG, PNG or WebP, at most 5 MiB and 20 megapixels, and not animated. Pillow decodes, strips metadata and re-encodes a fresh WebP with a maximum 1600-pixel dimension. Names are random UUIDs; original filenames are never used. Only site image paths are accepted as member photos/news covers; website links must be HTTPS or site-relative. No server-side URL fetch is performed. Orphan uploads are not automatically deleted.

## Local verification

Create a venv outside the repository and install `server/requirements.txt`. From the repository root:

```sh
python -m unittest discover -s server/tests -v
python -m server.cli --data-dir /absolute/local/test-data init --seed src/data/peopleContent.generated.json
```

Unit tests use only temporary databases and temporary photos. Production data is never used for CRUD tests. For interactive local HTTP testing, create the app explicitly with TESTING, a localhost ORIGIN/TRUSTED_HOSTS and COOKIE_SECURE=False. Production fails startup when insecure cookie settings are used.

## Installation and accounts

Install Ubuntu's `python3-venv` package if `python3 -c 'import ensurepip'` fails. Then run the reviewed `deploy/install-admin.sh SOURCE_DIRECTORY RELEASE_ID` on the server as root. It installs a new venv/code release, backs up the existing database when present, initializes new tables without replacing existing content, switches code atomically and checks API health. If health fails, it restores the previous code symlink. It does not touch Nginx, the frontend release or administrator passwords. An optional `MC2_WHEELHOUSE` supplies predownloaded wheels for offline installation.

The requested primary administrator usernames are `primo`, `jeannie` and `panhui`, each with the existing `admin` role, which provides the highest website content and publishing privileges. This request does not introduce a separate super-administrator role or account-management UI. Preserve existing accounts, including `secretary`; inspect `list-users` before creating or assigning accounts. These names describe the intended account setup, not confirmation that it has been provisioned on the live site.

Create each missing account separately. Run the CLI from `/opt/mc2-admin/current` as `mc2admin`, using `venv/bin/python -m server.cli create-user USERNAME --role admin --password-stdin` or `--role editor`. Omitting `--role` defaults to `admin` for compatibility; specify it explicitly for test accounts. Supply the password through standard input from a protected local file or a subprocess input stream. Never put it in a shell command argument or print it in logs. Any deliverable credential file should be created with mode 0600 and kept separate from the source repository. No accounts are automatically created by this package.

Initialization adds a role column to older databases and preserves existing accounts as `admin`, matching their previous privileges. It does not overwrite content, passwords or existing sessions. Operator commands include:

- `list-users`: shows usernames, roles, enabled state and first-password-change state; never password hashes.
- `set-role USERNAME admin` or `set-role USERNAME editor`: changes the role and revokes all of that account's sessions.
- `reset-password USERNAME --password-stdin`: preserves the role, revokes all sessions and requires another first-login change.
- `disable-user USERNAME`: disables access and revokes sessions.
- `backup`: creates a consistent database snapshot.

There is no public registration or UI for creating accounts or assigning roles. Member and alumni records are not login accounts. For IT testing, use two separate website accounts explicitly assigned `admin` and `editor` after the compatible API and frontend are deployed. Verify the actual roles with `list-users` and the session API before providing access; two different usernames alone do not establish different permissions.

## Recovery

Every successful members/news edit creates an immutable content-history row and an audit row in the same SQLite transaction. The `backup` command uses SQLite's online backup API, including WAL content, and saves mode-0600 snapshots under `backups/`. Back up the photos directory together with database snapshots for off-host recovery. Installation takes a database backup before switching an existing release. Never copy only the live `.sqlite3` file while ignoring its WAL.

To roll back code, switch `/opt/mc2-admin/current` to a compatible retained release and restart the service. **Do not run a previous single-role API while editor accounts remain enabled.** That API does not enforce the role column and would treat a logged-in editor as an administrator. Before such a rollback, disable every editor account with the current CLI, which also revokes its sessions, and keep those accounts disabled until role enforcement is restored and checked. Database restoration must preserve this restriction too.

Content is not rolled back by a code switch. To restore data, first stop the service, preserve the current database/WAL and photos, restore the selected complete backup and corresponding media, then restart and verify health. Do not remove historical revisions or uploads during routine deployment.

Framework references: [Flask security](https://flask.palletsprojects.com/en/stable/web-security/), [Gunicorn deployment](https://flask.palletsprojects.com/en/stable/deploying/gunicorn/), [Werkzeug password hashing](https://werkzeug.palletsprojects.com/en/stable/utils/), [Pillow image safety](https://pillow.readthedocs.io/en/stable/reference/Image.html).
