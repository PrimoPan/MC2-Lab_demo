"""Package tracked source and compiled site, excluding persistent runtime data."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile
from datetime import datetime, timezone


def main():
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    now = datetime.now(timezone.utc)
    release = now.strftime('%Y%m%dT%H%M%SZ') + '-' + commit[:12]
    with tempfile.TemporaryDirectory() as temp:
        root = Path(temp)
        shutil.copytree('build', root / 'site')
        for item in subprocess.check_output(['git', 'ls-files', '-z']).split(b'\0'):
            if not item:
                continue
            path = Path(item.decode())
            if path.is_file():
                target = root / 'source' / path
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, target)
        manifest = {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                    for folder in ('site', 'source')
                    for p in (root / folder).rglob('*') if p.is_file()}
        reusable = {}
        for name, digest in manifest.items():
            source_path = ('public/' + name[5:]) if name.startswith('site/') else name[7:]
            candidate = Path(source_path)
            if source_path.startswith('public/') and candidate.is_file() and hashlib.sha256(candidate.read_bytes()).hexdigest() == digest:
                reusable[name] = source_path
        for name in reusable:
            (root / name).unlink()
        (root / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
        (root / 'release.json').write_text(json.dumps({
            'release': release, 'commit': commit, 'working_tree': '',
            'built_at': now.isoformat(), 'file_count': len(manifest), 'reusable_files': reusable,
            'node': subprocess.check_output(['node', '--version'], text=True).strip()
        }, indent=2) + '\n')
        with tarfile.open('campus.tar.gz', 'w:gz') as archive:
            for path in root.iterdir():
                archive.add(path, arcname=path.name)
    digest = hashlib.sha256(Path('campus.tar.gz').read_bytes()).hexdigest()
    Path('campus.sha256').write_text(digest + '  campus.tar.gz\n')
    print(release)


if __name__ == '__main__':
    main()
