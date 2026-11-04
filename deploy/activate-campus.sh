#!/usr/bin/env bash
set -euo pipefail

release_id="${1:?Usage: activate-campus.sh RELEASE_ID}"
[[ "$release_id" =~ ^[0-9]{8}T[0-9]{6}Z-[a-f0-9]{7,40}(-dirty)?$ ]] || exit 2
site_base=/srv/mc2-lab
release_dir="$site_base/releases/$release_id"
test -d "$release_dir"

exec 9>"$site_base/.deploy.lock"
flock -x 9

# Verify both the complete file set and each byte hash before serving this release.
python3 - "$release_dir" <<'PY'
import hashlib, json, sys
from pathlib import Path
release = Path(sys.argv[1])
expected = json.loads((release / 'manifest.json').read_text())
actual = {}
for folder in ('site', 'source'):
    for path in (release / folder).rglob('*'):
        if path.is_symlink():
            raise SystemExit(f'Unexpected symlink: {path}')
        if path.is_file():
            actual[path.relative_to(release).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
if actual != expected:
    raise SystemExit('Release manifest verification failed')
assert (release / 'site/index.html').is_file(), 'Missing index.html'
print(f'Verified {len(actual)} website and source files')
PY

chown -R root:root "$release_dir"
# rsync preserves mktemp's 0700 staging-root mode. Nginx must traverse this parent.
chmod 755 "$release_dir"
chmod -R u=rwX,go=rX "$release_dir/site"
chmod -R u=rwX,go= "$release_dir/source"
nginx -t
previous="$(readlink "$site_base/current" || true)"
pending="$site_base/.current-$release_id"
ln -s "$release_dir" "$pending"
mv -Tf "$pending" "$site_base/current"

if ! curl --fail --silent --show-error --max-time 10 http://127.0.0.1:2026/index.html \
    | cmp -s - "$release_dir/site/index.html"; then
    if [[ -n "$previous" ]]; then
        ln -s "$previous" "$pending"
        mv -Tf "$pending" "$site_base/current"
    else
        unlink "$site_base/current"
    fi
    echo 'HTTP verification failed; release was not retained as current.' >&2
    exit 1
fi
if [[ -n "$previous" ]]; then
    ln -sfn "$previous" "$site_base/previous"
fi
echo "Active release: $release_id"
