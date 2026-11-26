# MC2 administration API

The public React website stays on Nginx. This Flask/Gunicorn API stores website accounts, sessions, member/alumni content, news, revision history and audit records in SQLite. Website accounts have an `admin` or `editor` role. The public member category `admin` still means an administrative lab position and grants no login rights.

This document describes the role-aware implementation. Deploying it, assigning roles to live test accounts and obtaining IT's penetration-test result are separate steps; the presence of this document does not confirm any of them.

## Runtime and data

- Python 3.12 or newer. Dependencies and their transitive packages are pinned in `requirements.txt` (checked against PyPI on 2026-10-26).
- Production: non-root `mc2admin` user, Gunicorn on `127.0.0.1:2027`, systemd unit `mc2-admin`.
- Versioned code and venv: `/opt/mc2-admin/releases/<release-id>`; `/opt/mc2-admin/current` selects the active version.
- Persistent data: `/var/lib/mc2-admin/admin.sqlite3`, `photos/`, and `backups/`. Never put these inside a frontend release.
- `/etc/mc2-admin.env` contains `MC2_DATA_DIR`, the single HTTPS `MC2_ORIGIN`, and `MC2_TRUST_LOCAL_PROXY=1`. Nginx must overwrite `X-Real-IP`; the API trusts it only on loopback when explicitly enabled. No proxy headers control authentication or cookie security.
- Nginx must proxy both `/api/` and `/media/people/` to Gunicorn. A direct filesystem alias for uploaded photos would bypass approval privacy and must not remain enabled. The existing campus gateway provides HTTPS; fixed Secure cookies are compatible with the private HTTP hop.

## Drafts, review and publication

The campus database has separate public `people`/`news` tables and a single shared
`workspace`. All editors and administrators may add/delete members, edit alumni,
edit the detailed bilingual leader profile, and create/edit/delete news. Every
content save changes only the workspace. This includes `PUT /api/admin/people`
and `PUT /api/admin/news`; these legacy URLs no longer publish content.

Only the configured account `MC2_REVIEWER_USERNAME` (default `primo`), with the
`admin` role, can approve or return a submission. Other `admin` accounts have no
publication bypass. Jeannie should use `editor`; retaining an old admin role
also does not grant approval access. Member roles such as `chair` and `admin`
are public classification and never account privileges.

The lifecycle is `published → draft → submitted → published`, or
`submitted → rejected → draft/submitted`. Saving a submitted or rejected
workspace changes it to `draft`, clearing submission metadata. Every save,
submission, return and approval increments one shared revision. A stale save or
approval receives 409, so the reviewer cannot publish a newer, unseen edit.
The frontend must preserve unsaved work and deliberately reload on conflict.

Approval copies the **complete** people/leader/alumni/news snapshot into the
public tables in one transaction, with both public history records and an audit
record. The public base revisions must still match; out-of-band public changes
cause 409 and require operator reconciliation, never a silent overwrite.
Draft history records retain every saved/submitted/returned/approved snapshot.
A saved post's `published` flag expresses desired visibility **after approval**;
new posts normally use `true`, and `false` requests withdrawal or exclusion.

Initialization is additive and idempotent: it creates a workspace from existing
public data only when no workspace exists. It never imports seed data over live
content or discards a pending submission. The new optional leader fields stay
absent until edited, preserving the existing frontend fallback.

## API

| Route | Result / write body |
| --- | --- |
| `GET /api/people` | Public `{revision,content}` only |
| `GET /api/news` | Public `{revision,posts}` with visible posts only |
| `GET /api/admin/session` | `{user:{username,mustChangePassword,role,canReview},csrfToken}` or 401 |
| `POST /api/admin/login` | `{username,password}`; returns the session shape |
| `POST /api/admin/password` | `{currentPassword,newPassword}`; rotates all sessions |
| `POST /api/admin/logout` | Revokes the current session |
| `GET /api/admin/people` | `{revision,content,workflow}` from the shared workspace |
| `PUT /api/admin/people` | `{revision,content}`; saves the draft; same result shape |
| `GET /api/admin/news` | `{revision,posts,workflow}` from the shared workspace |
| `PUT /api/admin/news` | `{revision,posts}`; saves the draft; same result shape |
| `GET /api/admin/review` | `{revision,content,posts,workflow,live:{people:{revision,content},news:{revision,posts}}}` |
| `POST /api/admin/review/submit` | `{revision}`; submits the complete saved workspace |
| `POST /api/admin/review/approve` | `{revision}`; designated reviewer only; atomically publishes all changes |
| `POST /api/admin/review/reject` | `{revision,reason}`; designated reviewer only; preserves the draft |
| `POST /api/admin/photos` | Multipart `file`; returns `{url}` with status 201 |

Review actions return the complete review snapshot. `workflow` contains
`status`, `revision`, `canReview`, `submittedBy`, `submittedAt` (Unix seconds),
`reason` and `reviewer` (configured account name). Public and workspace revision
numbers are independent. Admin reads require authentication and completion of
the initial password change; public APIs never expose the workspace.

Every write requires the exact configured Origin. Authenticated writes also
require `X-CSRF-Token` from the current session. Permissions and session validity
are checked again inside write transactions. Denied permissions return 403 with
`code: "insufficientPermission"`; validation errors return 400. Login has
persistent account/IP attempt limits. Passwords use Werkzeug scrypt; new passwords
must contain 14–128 Unicode characters. Sessions last eight hours, have HttpOnly,
Secure, SameSite=Strict cookies, and store only hashes of random session IDs.

## Content and image validation

People require matching bilingual keys, shared properties, role filters and
corresponding alumni group lengths. Member keys are stable public anchors.
The optional `leader` object must exist in both locales or neither; it contains
plain text profile labels, `photo`, `homepage`, bounded `sections` (title and
paragraphs), and `projects` (title and body).

News keeps `id`, immutable `slug`, `date`, bilingual `title`, `summary`, `body`,
`image`, and desired `published` visibility. Optional `template` is one of
`announcement`, `image-left`, `image-right`, `gallery`. Optional `sections`
contains up to 40 entries with `id`, `layout` (`text`, `image-left`, `image-right`,
`gallery`), bilingual `heading` and `body`, and up to 8 `images`. Each image has
`id`, a site-image `url`, bilingual `alt` and `caption`. All text is plain text,
never trusted HTML. A nonempty English body or a section with English body/image
is required, along with an English title. The whole saved section document is
limited to 2 MiB. Legacy posts without templates/sections remain valid.

Images must be JPEG, PNG or WebP, at most 5 MiB and 20 megapixels, and not
animated. Pillow decodes, strips metadata and re-encodes WebP at a maximum
1600-pixel dimension. Random UUID filenames prevent filename injection. Only
site image paths are accepted; website links must be HTTPS or site-relative.
No server-side URL fetch occurs. Orphan uploads are not automatically deleted.
Uploaded media is served anonymously only while its exact path is referenced by
public people/leader content or a visible, approved news post. Otherwise an active
editor/reviewer session with the initial password already changed is required;
anonymous requests receive 404. Media responses use `private, no-store` so future
withdrawal or removal takes effect without a stale public cache. This enforcement
requires the Nginx proxy above; a static alias would be a publication bypass.

## Local verification

Create a venv outside the repository and install `server/requirements.txt`. From the repository root:

```sh
python -m unittest discover -s server/tests -v
python -m server.cli --data-dir /absolute/local/test-data init --seed src/data/peopleContent.generated.json
```

Unit tests use only temporary databases and temporary photos. Production data is never used for CRUD tests. For interactive local HTTP testing, create the app explicitly with TESTING, a localhost ORIGIN/TRUSTED_HOSTS and COOKIE_SECURE=False. Production fails startup when insecure cookie settings are used.

## Installation and accounts

Install Ubuntu's `python3-venv` package if `python3 -c 'import ensurepip'` fails. Then run the reviewed `deploy/install-admin.sh SOURCE_DIRECTORY RELEASE_ID` on the server as root. It installs a new venv/code release, backs up the existing database when present, initializes new tables without replacing existing content, switches code atomically and checks API health. If health fails, it restores the previous code symlink. It does not touch Nginx, the frontend release or administrator passwords. An optional `MC2_WHEELHOUSE` supplies predownloaded wheels for offline installation.

The publishing owner is `primo` (admin). Use `editor` for `jeannie` and other
content editors. Preserve existing accounts and inspect `list-users` before
creating or assigning accounts. This document describes intended configuration,
not proof that it has been applied to a live server. No account-management UI or
public registration is provided. Account passwords are never embedded in source.

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

To roll back code, switch `/opt/mc2-admin/current` only to a release that enforces
this review workflow, then restart and verify. **Do not reactivate a previous
API that publishes on PUT**, even if editor roles are disabled: old administrator
accounts could bypass the owner review gate. A safe emergency rollback must
first stop all authenticated writes at Nginx or disable every account, preserving
public read-only availability until the review-capable API is restored.

Content is not rolled back by a code switch. Before restoring data, stop the
service, preserve the current database/WAL and photos, restore the selected
complete backup and corresponding media, then restart and verify health and
permissions. Do not remove historical revisions or uploads during deployment.
