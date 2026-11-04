"""Fetch successful main releases; no inbound campus SSH or stored GitHub token."""
import fcntl
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import tarfile
import tempfile
import urllib.error
import urllib.request

REPO = 'PrimoPan/MC2-Lab_demo'
API = 'https://api.github.com/repos/' + REPO
BASE = Path('/srv/mc2-lab')


def get(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'MC2-campus-deploy'})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def unpack(archive, destination):
    with tarfile.open(archive) as bundle:
        members = bundle.getmembers()
        if sum(m.size for m in members) > 2 * 1024**3:
            raise ValueError('Release is too large')
        for member in members:
            path = PurePosixPath(member.name)
            if path.is_absolute() or '..' in path.parts or not (member.isfile() or member.isdir()):
                raise ValueError('Unsafe release member')
            if not path.parts or path.parts[0] not in ('site', 'source', 'manifest.json', 'release.json'):
                raise ValueError('Unexpected release member')
        bundle.extractall(destination, members=members, filter='data')


def verify(root, commit):
    metadata = json.loads((root / 'release.json').read_text())
    release = metadata['release']
    if metadata['commit'] != commit or not re.fullmatch(r'\d{8}T\d{6}Z-' + commit[:12], release):
        raise ValueError('Commit or release identity mismatch')
    expected = json.loads((root / 'manifest.json').read_text())
    actual = {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
              for folder in ('site', 'source') for p in (root / folder).rglob('*') if p.is_file()}
    if actual != expected or not (root / 'site/index.html').is_file():
        raise ValueError('Release manifest mismatch')
    return release


def main():
    with (BASE / '.pull.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            latest = json.loads(get(API + '/releases/latest'))
        except urllib.error.HTTPError as error:
            if error.code == 404:
                print('No campus release published yet')
                return
            raise
        tag = latest['tag_name']
        if latest['draft'] or latest['prerelease'] or not re.fullmatch(r'campus-[a-f0-9]{40}', tag):
            raise ValueError('Not a campus release')
        commit = tag.removeprefix('campus-')
        current = BASE / 'current/release.json'
        if current.exists() and json.loads(current.read_text())['commit'] == commit:
            print('Already deployed ' + commit)
            return
        if json.loads(get(API + '/commits/main'))['sha'] != commit:
            print('Waiting for a successful release of current main')
            return
        assets = {a['name']: a for a in latest['assets']}
        prefix = 'https://github.com/' + REPO + '/releases/download/' + tag + '/'
        urls = [assets[name]['browser_download_url'] for name in ('campus.tar.gz', 'campus.sha256')]
        if urls != [prefix + 'campus.tar.gz', prefix + 'campus.sha256']:
            raise ValueError('Unexpected asset URL')
        with tempfile.TemporaryDirectory(prefix='.pull-', dir=BASE / 'releases') as temp:
            stage = Path(temp)
            archive = stage / 'download.tar.gz'
            archive.write_bytes(get(urls[0]))
            digest = get(urls[1]).decode().split()[0]
            if hashlib.sha256(archive.read_bytes()).hexdigest() != digest:
                raise ValueError('Download checksum mismatch')
            unpack(archive, stage)
            archive.unlink()
            release = verify(stage, commit)
            # A frontend push cannot silently replace the running API or its database.
            api_source = Path('/opt/mc2-admin/current/server')
            for name in ('app.py', 'cli.py', 'validation.py', '__init__.py', 'requirements.txt'):
                if (stage / 'source/server' / name).read_bytes() != (api_source / name).read_bytes():
                    raise ValueError('Deploy matching API first: ' + name)
            if json.loads(get(API + '/commits/main'))['sha'] != commit:
                print('Main advanced during download; retaining current release')
                return
            target = BASE / 'releases' / release
            if target.exists():
                verify(target, commit)
            else:
                shutil.copytree(stage, target)
            subprocess.run(['/usr/local/sbin/mc2-lab-activate', release], check=True)
            print('Deployed campus commit ' + commit, flush=True)


if __name__ == '__main__':
    main()
