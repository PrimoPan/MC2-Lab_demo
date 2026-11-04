#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"
deploy_host="${MC2_DEPLOY_HOST:-mc2web}"
ssh_options=(-o BatchMode=yes -o ConnectTimeout=10)
ssh "${ssh_options[@]}" "$deploy_host" 'test -x /usr/local/sbin/mc2-lab-activate'
VITE_PEOPLE_API_ENABLED=true npm run build

release_id="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short=12 HEAD)"
if [[ -n "$(git status --porcelain)" ]]; then
    release_id="$release_id-dirty"
fi
staging="$(mktemp -d "${TMPDIR:-/tmp}/mc2-campus.XXXXXX")"
trap 'rm -rf "$staging"' EXIT

python3 - "$staging" "$release_id" <<'PY'
import hashlib, json, shutil, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path
staging, release_id = Path(sys.argv[1]), sys.argv[2]
shutil.copytree('build', staging / 'site')
paths = subprocess.check_output([
    'git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--',
    'src', 'public', 'content', 'tools', 'deploy', 'docs', 'server', '.github',
    'README.md', 'package.json', 'package-lock.json', 'vite.config.ts',
    'tsconfig.json', 'index.html', '.nvmrc', '.gitignore', '.gitattributes'
]).split(b'\0')
for item in paths:
    if not item:
        continue
    path = Path(item.decode())
    if path.is_file():
        dest = staging / 'source' / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
manifest = {
    path.relative_to(staging).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
    for folder in ('site', 'source')
    for path in (staging / folder).rglob('*') if path.is_file()
}
(staging / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
(staging / 'release.json').write_text(json.dumps({
    'release': release_id,
    'commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
    'working_tree': subprocess.check_output(['git', 'status', '--porcelain'], text=True),
    'built_at': datetime.now(timezone.utc).isoformat(),
    'node': subprocess.check_output(['node', '--version'], text=True).strip(),
    'file_count': len(manifest)
}, indent=2) + '\n')
print(f'Prepared {len(manifest)} website and source files')
PY

ssh "${ssh_options[@]}" "$deploy_host" "mkdir /srv/mc2-lab/releases/$release_id"
reference_options=()
if ssh "${ssh_options[@]}" "$deploy_host" 'test -L /srv/mc2-lab/current'; then
    # Reuse unchanged bytes already on the server, without sharing mutable hardlinks.
    reference_options=(--copy-dest=/srv/mc2-lab/current)
fi
rsync -a --no-owner --no-group --quiet "${reference_options[@]}" -e 'ssh -o BatchMode=yes -o ConnectTimeout=10' \
    "$staging/" "$deploy_host:/srv/mc2-lab/releases/$release_id/"
ssh "${ssh_options[@]}" "$deploy_host" "/usr/local/sbin/mc2-lab-activate $release_id"
echo 'Campus deployment verified. Connect with: ssh mc2web'
