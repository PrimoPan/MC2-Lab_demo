# Campus deployment

## Canonical campus migration (2026-11-04)

The canonical website is https://mc2.hkust-gz.edu.cn. The former
https://mc2-lab.space host becomes a path- and query-preserving HTTP 301
redirect, using `deploy/nginx-legacy-redirect.conf`. Keep its DNS, registration
and certificate renewal while redirects are needed. Do not shut down the
shared server: it also hosts FEAR Lab and Surreality.

Pushes to `PrimoPan/MC2-Lab_demo:main` now run frontend checks and API tests,
build with the campus API enabled, and publish a commit-specific GitHub Release.
Only tracked public source and compiled website files enter that package.
The campus host runs `mc2-campus-pull.timer` every five minutes. It downloads
successful current-main releases over HTTPS, verifies the archive checksum,
commit identity and complete file manifest, and uses the existing atomic
activation/rollback script. There is no dependency on the former web server,
a running laptop, an inbound public SSH port, or stored GitHub credentials.
GitHub performs CI/building; website execution, content, accounts, photos and
release activation are on campus.

The timer deploys the frontend and matching source. If API code/dependencies
change, it refuses to publish until the compatible API has been explicitly
updated using the procedure below. It never resets or imports People data on
push; the campus database remains authoritative after the initial migration.

Install the reviewed poller and units as root:

```bash
install -m 644 deploy/pull-campus.py /usr/local/lib/mc2-campus-pull.py
install -m 644 deploy/mc2-campus-pull.service /etc/systemd/system/
install -m 644 deploy/mc2-campus-pull.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now mc2-campus-pull.timer
systemctl start mc2-campus-pull.service
journalctl -u mc2-campus-pull.service -n 30 --no-pager
```

To pause automatic publishing before a manual rollback, stop the timer first:
`systemctl stop mc2-campus-pull.timer`.
The prior GitHub workflow uploaded to the old server. That workflow has been
replaced; its legacy deploy secrets are no longer referenced.

The campus release combines a React frontend served by Nginx with a Python API
and SQLite storage. The public site is `https://mc2.hkust-gz.edu.cn`; the content
workspace is `/admin`. Campus TLS terminates at the university gateway, which
forwards HTTP to the server on port **2026**. Nginx forwards `/api/` to Gunicorn
on **127.0.0.1:2027**.

This document describes the implementation and operating procedure. Record
deployment, external HTTPS checks and authenticated penetration-test acceptance
separately. The admin/editor implementation documented below must be deployed
and the live account roles verified before claiming that both test permission
levels are available.

The local SSH alias is `mc2web`. Its address and dedicated key are configured in
`~/.ssh/config`; credentials and private keys are not in this repository.
Connect from the campus network or a VPN that can reach the host.

## Build and publish the frontend

```bash
nvm use
npm ci --legacy-peer-deps
npm run deploy:campus
```

`tools/deploy-campus.sh` builds with `VITE_PEOPLE_API_ENABLED=true`, runs the
TypeScript check, and uploads the frontend and a matching source snapshot. The
server verifies the complete SHA-256 manifest before atomically switching
`/srv/mc2-lab/current`. A failed served-HTML comparison restores the previous
frontend release. Uncommitted changes are marked `dirty` in `release.json`.

This command publishes the frontend and source only. It does **not** install or
upgrade Python dependencies, restart the API, or replace Nginx configuration.
Deploy a compatible API whenever the API contract changes. For admin/editor
support, deploy the API with its additive role migration before exposing editor
accounts, then deploy the matching frontend and verify both roles. Do not enable
editor accounts against an API that treats every authenticated user as an
administrator. Node.js is needed on the build machine; Python and Gunicorn run
on the campus host.

Public People data comes from `/api/people`, with the checked-in JSON as a
fallback when the API is unavailable. Public News adds published API articles to
the existing static archive. Existing static News articles are not editable in
this workspace.

## Install or update the API

Review `server/requirements.txt`, `deploy/install-admin.sh`, the service unit and
Nginx configuration before installation. Use the distribution's Python 3 and
`python3-venv` package. The installer needs package-index access, or a prepared
wheel directory passed through `MC2_WHEELHOUSE`.

After the reviewed source is present on the host, run as root. The example uses
the source snapshot from the current frontend release:

```bash
release_id=$(basename "$(readlink -f /srv/mc2-lab/current)")
reviewed_source="/srv/mc2-lab/releases/$release_id/source"
bash "$reviewed_source/deploy/install-admin.sh" "$reviewed_source" "$release_id"
```

Each API release ID must be new. The installer creates a separate virtual
environment, installs the pinned dependencies, creates the `mc2admin` system
user if necessary, and initializes persistent storage. Initialization seeds
People only when no content exists; subsequent installs preserve current
members, alumni, news and accounts. The role migration preserves existing
accounts as `admin`, matching their former permissions, and keeps their passwords
and sessions. No website account is created by the installer.

Before updating an existing database, the installer uses SQLite's backup API to
save a consistent database snapshot under `/var/lib/mc2-admin/backups`. That
snapshot does not include uploaded photos. The installer switches the API
`current` symlink, installs the systemd unit and checks `/api/healthz`. Its failed
health-check branch attempts to restore the previous API code. An earlier
installer or service-start failure may require manual rollback; inspect the
exit status and service logs. Environment, service configuration and database
changes are not automatically restored by that code rollback.

Back up existing Nginx files, then install both repository configurations:

```bash
config_backup="/srv/mc2-lab/backups/admin-config-$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 700 "$config_backup"
cp -a /etc/nginx/sites-available/mc2-lab "$config_backup/"
cp -a /etc/nginx/snippets/mc2-security-headers.conf "$config_backup/"
install -m 644 "$reviewed_source/deploy/nginx-campus.conf" /etc/nginx/sites-available/mc2-lab
install -m 644 "$reviewed_source/deploy/nginx-security-headers.conf" /etc/nginx/snippets/mc2-security-headers.conf
nginx -t
systemctl reload nginx
```

Check `nginx -t` succeeds before reloading. Nginx must overwrite `X-Real-IP` and
forward the original site Host header. The API trusts only its local proxy and
checks browser Origin against `MC2_ORIGIN`. Port 2027 must remain local; campus
inbound access uses port 2026.

## Server layout

| Path | Purpose |
| --- | --- |
| `/srv/mc2-lab/current/site` | Active public frontend |
| `/srv/mc2-lab/current/source` | Private matching source snapshot |
| `/srv/mc2-lab/releases/` | Frontend releases, manifests and metadata |
| `/srv/mc2-lab/previous` | Previous frontend release |
| `/srv/mc2-lab/backups/` | Private migration and configuration backups |
| `/opt/mc2-admin/current` | Active API release symlink |
| `/opt/mc2-admin/releases/` | API source and per-release Python environments |
| `/var/lib/mc2-admin/admin.sqlite3` | Content, accounts, session hashes, history and audit records |
| `/var/lib/mc2-admin/photos/` | Persistent uploaded WebP images |
| `/var/lib/mc2-admin/backups/` | Private SQLite snapshots |
| `/etc/mc2-admin.env` | API data path, HTTPS origin and local-proxy setting |
| `/etc/systemd/system/mc2-admin.service` | API service, running as `mc2admin` |
| `/etc/nginx/sites-available/mc2-lab` | Campus web and API proxy configuration |
| `/etc/nginx/snippets/mc2-security-headers.conf` | Shared response headers |
| `/usr/local/sbin/mc2-lab-activate` | Frontend verification and activation script |

Content and accounts live outside both release trees. A frontend deployment or
API code rollback does not reset them. Only the compiled `site` directory and
`/media/people/` photo directory are publicly served. The source snapshot,
database, environment file and backups must remain private.

## Accounts and permissions

The existing browser entry is `https://mc2.hkust-gz.edu.cn/admin`; a separate
login page is not needed for each role. Website accounts use two permission
levels, enforced by the API and reflected in the frontend:

| Capability | `admin` | `editor` |
| --- | --- | --- |
| Read members, alumni and news, including news drafts | Yes | Yes |
| Save members or alumni to the public site | Yes | No |
| Create, edit or delete unpublished news drafts | Yes | Yes |
| Upload images | Yes | Yes |
| Publish or withdraw news | Yes | No |
| Change, delete or reorder published news | Yes | No |
| Change own password and log out | Yes | Yes |

Members/alumni have no draft layer: saving them immediately changes the public
site, so editors can only view them. News draft changes remain available for an
administrator to review and publish. There is no separate approval queue or
public account-creation endpoint. A person's public category `admin` means an
administrative staff position and grants no website login permission.

Login, session lookup and password-change responses include `user.role` as
`admin` or `editor`. The API checks the current database role and rechecks content
writes within their transaction. An unauthorized role operation returns HTTP
403 with `code: "insufficientPermission"`; a client cannot gain publication
rights by restoring a hidden button or submitting a different role in JSON.

The requested primary administrator accounts are `primo`, `jeannie` and
`panhui`. Assign each the existing `admin` role, the highest website content and
publishing permission level; no additional super-administrator role or
account-management UI is required. Preserve existing accounts, including
`secretary`. This is the intended setup, not a live provisioning record.

Inspect accounts with `list-users` before creating any missing account or
changing an existing role. Create or reset accounts with `server.cli` on the
host. Passwords are read from standard input, never command arguments, source
files or application logs. For example, from `/opt/mc2-admin/current` as root,
create `jeannie` only if absent:

```bash
runuser -u mc2admin -- ./venv/bin/python -m server.cli list-users
python3 -c 'import getpass; print(getpass.getpass("Initial password: "))' \
  | runuser -u mc2admin -- ./venv/bin/python -m server.cli create-user jeannie --role admin --password-stdin
runuser -u mc2admin -- ./venv/bin/python -m server.cli list-users
```

Use the same procedure for a missing `primo` or `panhui` account. Existing
accounts do not need a password reset merely to gain or retain the `admin` role.

Use `--role editor` when creating an editor account. The default, if omitted,
is `admin` for compatibility; specify the role explicitly for test accounts.
`list-users` includes each account's role. `set-role USERNAME admin` or
`set-role USERNAME editor` changes the role and revokes all of that account's
sessions. `reset-password` uses the same stdin flow, preserves the role and
revokes sessions; `disable-user USERNAME` disables access and revokes sessions.
Keep initial credentials in the separate private handoff, never this document.
The UI cannot create accounts or assign permissions. Password recovery is an
operator CLI action. Account creation or reassignment is a separate operational
step from installing the role-aware code.

Both roles must change initial or reset passwords before reading news drafts or
performing content or photo writes.
Passwords must be 14–128 characters; recommend 16 or more. Password changes
rotate the current session and revoke the account's other sessions. Sessions use
Secure, HttpOnly, SameSite=Strict cookies, with random bearer tokens stored only
as hashes. The server checks authentication, Origin and CSRF tokens for writes,
and rate-limits login and uploads. Production refuses insecure cookies or an
HTTP `MC2_ORIGIN`.

Use the public **HTTPS** `/admin` address for login. Direct remote HTTP access to
port 2026 cannot submit credentials through the UI and cannot carry the Secure
session cookie. Do not weaken those controls to make an HTTP tunnel work.

## Content and photos

Members and alumni are saved as a single bilingual document with a revision
number. Stale writes return HTTP 409 instead of overwriting newer work. Names,
position titles and research descriptions remain separately editable in each
language. Member keys remain stable when names change. Role, term, year, photo,
website and source-photo references are shared across languages.

New News articles have drafts and a published flag. Saving a draft does not
publish it; Publish, Withdraw and Delete are distinct actions in the editor.
The public API returns published articles only. Historical static News continues
to come from the source archive and is outside this editor. Content history and
audit rows are recorded on committed saves; there is no browser undo/history
restoration interface.

Uploads accept non-animated JPEG, PNG or WebP up to 5 MiB and 20 megapixels. The
server decodes and re-encodes them as WebP, strips metadata and limits the output
to 1600×1600. Uploaded images are available through public `/media/people/` URLs
as soon as uploaded, even before a member or News draft is saved/published. Do
not upload confidential material. Deleting a record does not remove its image
file. Automatic image garbage collection is not implemented.

## Verification and operation

On the campus host:

```bash
systemctl status nginx mc2-admin --no-pager
nginx -t
curl -fsS http://127.0.0.1:2026/healthz
curl -fsS -H 'Host: mc2.hkust-gz.edu.cn' http://127.0.0.1:2027/api/healthz
curl -fsS -H 'Host: mc2.hkust-gz.edu.cn' http://127.0.0.1:2026/api/people
journalctl -u mc2-admin -n 100 --no-pager
cat /srv/mc2-lab/current/release.json
readlink -f /opt/mc2-admin/current
```

Health responses confirm reachability, not complete acceptance. Verify the actual
HTTPS entry in a browser: login, first password change, account role display,
image loading, conflict handling and logout. Verify administrator publication
and editor draft editing separately. The editor must be unable to save
members/alumni, publish, withdraw or change published news, including by direct
API requests with a valid editor session and CSRF token. A role change must
invalidate that account's existing sessions. Use temporary databases and local
content for CRUD and bypass tests, not production pages. On production, inspect
roles and access without publishing test content. Reopen public pages after any
authorized content change to confirm the intended result; a successful build or
HTTP 200 alone is not proof of the full workflow.

Keep Nginx logs under `/var/log/nginx/mc2-lab-{access,error}.log` and API output in
journald. Do not copy passwords, cookies, CSRF tokens or private backups into
reports. Monitor disk space on both `/srv/mc2-lab` and `/var/lib/mc2-admin`.

## Backups and rollback

A live database-only snapshot is available through:

```bash
cd /opt/mc2-admin/current
runuser -u mc2admin -- ./venv/bin/python -m server.cli backup
```

For a full restorable copy, stop `mc2-admin`, copy **all** of
`/var/lib/mc2-admin` (including photos and any SQLite WAL/SHM files), plus the
environment, service and Nginx configurations, into a private backup directory,
then restart the service. Do not copy only the active SQLite main file while
writes are running. Preserve ownership and file modes. Database restoration
also restores the accounts and content state at the backup time.

Frontend rollback uses a verified retained release:

```bash
ls -1 /srv/mc2-lab/releases
/usr/local/sbin/mc2-lab-activate FRONTEND_RELEASE_ID
```

API rollback is separate. Choose a retained API release compatible with the
current database, frontend contract and role enforcement. **Do not roll back to
the earlier single-role API while editor accounts remain enabled:** it ignores
the role column and grants every authenticated account administrator behavior.
Before such a rollback, use the current `disable-user USERNAME` command on every
editor account; this also revokes its sessions. Keep them disabled until the
role-aware API is restored and checked. A database restore must not re-enable
these accounts on the single-role API.

After these compatibility and access checks, run as root:

```bash
api_release=/opt/mc2-admin/releases/API_RELEASE_ID
test -d "$api_release"
ln -s "$api_release" /opt/mc2-admin/current.rollback
mv -Tf /opt/mc2-admin/current.rollback /opt/mc2-admin/current
systemctl restart mc2-admin
curl -fsS -H 'Host: mc2.hkust-gz.edu.cn' http://127.0.0.1:2027/api/healthz
```

If Nginx, environment or service configuration caused the problem, restore the
reviewed corresponding backup, validate Nginx and reload/restart the affected
services. Code rollback leaves persistent data intact. Restore data only as a
separate recovery action, with the API stopped and the current data preserved
first; select matching database and photo copies. Do not overwrite newer content
merely to undo a frontend release. Keep at least current and previous releases;
there is no automatic release cleanup.

## Rollout record: 2026-11-02

The admin/editor API and matching frontend were deployed to the MC2 campus
host. Confirmed release and recovery paths:

| Item | Path |
| --- | --- |
| API release | `/opt/mc2-admin/releases/20261102-admin-editor-v1` |
| Frontend release | `/srv/mc2-lab/releases/20261102T035432Z-dec9d0710815-dirty` |
| Database backup before migration/provisioning | `/var/lib/mc2-admin/backups/admin-20261102T035936Z-e9eb5f74.sqlite3` |

The 24 API tests passed on the server using temporary data. Database comparisons
against the backup confirmed that People and News content and revisions did not
change, and the original four accounts' password hashes were preserved.

All six accounts below were confirmed enabled after provisioning:

| Account | Role | Account action |
| --- | --- | --- |
| `primo` | `admin` | Existing account and password preserved |
| `jeannie` | `admin` | Created; initial password change required |
| `panhui` | `admin` | Created; initial password change required |
| `secretary` | `admin` | Existing account unchanged |
| `itsec_test1` | `admin` | Existing test account; password preserved |
| `itsec_test2` | `editor` | Existing test account assigned editor; password preserved |

Final public HTTPS checks used certificate-verified connections. `/admin` and
the deployed `index-CX7f_Hf8.js` and `AdminPeoplePage-CSQwpoOy.js` assets returned
200; API health was healthy and an anonymous session request returned 401.
`jeannie`, `panhui`, `itsec_test1` and `itsec_test2` each logged in successfully,
returned the expected role with `mustChangePassword: true`, and retrieved their
session with 200. The initial-password gate returned 403; logout without valid
CSRF returned 403, valid logout returned 200, and replaying the old cookie
returned 401.

`primo` was checked through account metadata and the preserved password hash;
its existing password was not available for a login check. The public People
and News response fingerprints matched their predeployment values. Production
passwords were not changed for verification; content-write and publication
permission tests used temporary data. These checks do not replace IT's
authenticated penetration test or establish its acceptance.

No email was sent. Credentials remain outside the repository. This rollout note
was added locally after the deployed source snapshot and does not update that
snapshot.

## Security review and campus routing

The Nginx configuration repeats the security-header include alongside cache
headers because Nginx 1.24 does not inherit server-level headers into locations
that define `add_header`. The CSP permits the site's existing resource origins;
inline CSS remains for React/vendor styling, while inline scripts and eval are
not permitted. The campus TLS gateway passes the origin's public-host HSTS
header through. Check console/CSP
errors when introducing external resources; do not add broad exceptions without
checking the required origin.

On 2026-10-26 OpenSSH was updated through signed Ubuntu packages to
`1:9.6p1-3ubuntu13.20`. The nine patchable medium/high CVEs in the 2026-10-23 scan
were already covered by Ubuntu backports. CVE-2023-51767 was referred for scanner
review against Ubuntu's not-affected rationale; its public table did not
explicitly list noble. Match the full distribution package version rather than only the
upstream `9.6` banner. Maintenance backups are retained at
`/srv/mc2-lab/backups/security-20261026-nginx/` and
`/var/backups/mc2-security-20261026-openssh/`.

On 2026-10-28 the remaining web-header hardening was applied after verifying
the public certificate and HTTP-to-HTTPS redirect. HSTS starts at `max-age=86400`
for `mc2.hkust-gz.edu.cn` only, without `includeSubDomains` or preload. Keep the
campus certificate renewed; increasing this initial one-day duration is a
separate operational decision. The `map` in `nginx-campus.conf` and the shared
header snippet must be deployed together. Direct IP/localhost requests receive
no HSTS header. Browsers only honor HSTS over HTTPS.

COEP uses `credentialless` so public third-party images and styles can load
without cross-site credentials; the site's external workshop logos and fonts
were checked in the regular Chrome session through a local SSH tunnel. At the
time, direct Chrome access to the campus hostname still returned
`ERR_CONNECTION_CLOSED`, while direct HTTPS requests succeeded. This tunnel
check does not claim that the local browser's campus DNS/proxy issue is fixed.

Successful authenticated API logout now clears this origin's cache and storage
with `Clear-Site-Data: "cache", "storage"`. The existing host-only session cookie
is expired separately and its server session is revoked. Do not use the
`"cookies"` or `"*"` directives: they can clear cookies across the registered
campus domain. Public page loads and failed logout attempts do not clear data.
The scanner's homepage-only Clear-Site-Data finding should be reviewed against
this logout-specific behavior, rather than adding a destructive global header.

Header rollback copies are under
`/srv/mc2-lab/backups/security-20261028-headers/`. The API patch source is under
`/srv/mc2-lab/security-source-20261028/`; its release is
`/opt/mc2-admin/releases/20261028-security-logout-v1`. The previous API release
remains available subject to the role-compatibility restriction above. The 12 API
tests, including logout/CSRF/session revocation and header scope, passed before
that October deployment; this historical result does not verify the later role
implementation.

On 2026-11-02, the user relayed IT's response that the SSH findings were false
positives and the scan had no other remediation items. Treat that as the
user-provided scan disposition; it does not confirm an authenticated penetration
test has passed. IT still requested the website login address and two test
accounts with different privileges.

For that test, the login address is the browser-facing HTTPS `/admin` page.
After deploying and checking role enforcement, use separate `admin` and `editor`
website accounts and verify the real roles with `list-users` and the session
API. Provide credentials only through the agreed private process. These are
website accounts, not SSH credentials. No account provisioning, delivery or
penetration-test acceptance is established merely by this documentation, and
this deployment workflow does not send any email.

Campus IT must route the public domain to this host's HTTP port 2026, preserve the
Host header, and forward `/api/`, `/media/people/` and `/admin` as well as frontend
routes. DNS alone does not provide Internet access to a private address. The older `mc2-lab.space` domain redirects to the campus site after migration.
GitHub builds are pulled outbound by the campus host as described above.
`npm run deploy:campus` remains a manual operator fallback.
