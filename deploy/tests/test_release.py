import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('pull', Path(__file__).parents[1] / 'pull-campus.py')
pull = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pull)


class ReleaseTest(unittest.TestCase):
    def archive(self, member):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        path = Path(temp.name) / 'test.tar.gz'
        with tarfile.open(path, 'w:gz') as bundle:
            bundle.addfile(member, io.BytesIO(b'x') if member.isfile() else None)
        return path, Path(temp.name) / 'out'

    def test_reject_path_traversal(self):
        member = tarfile.TarInfo('../escape')
        member.size = 1
        path, destination = self.archive(member)
        with self.assertRaises(ValueError):
            pull.unpack(path, destination)

    def test_reject_symlink(self):
        member = tarfile.TarInfo('site/link')
        member.type = tarfile.SYMTYPE
        member.linkname = '/etc/passwd'
        path, destination = self.archive(member)
        with self.assertRaises(ValueError):
            pull.unpack(path, destination)

    def test_reject_unexpected_root(self):
        member = tarfile.TarInfo('runtime/secrets')
        member.size = 1
        path, destination = self.archive(member)
        with self.assertRaises(ValueError):
            pull.unpack(path, destination)

    def test_manifest_and_commit(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'site').mkdir()
            (root / 'source').mkdir()
            (root / 'site/index.html').write_text('website')
            commit = 'a' * 40
            release = '20261104T120000Z-' + commit[:12]
            (root / 'release.json').write_text(json.dumps({'release': release, 'commit': commit}))
            (root / 'manifest.json').write_text(json.dumps({'site/index.html': hashlib.sha256(b'website').hexdigest()}))
            self.assertEqual(pull.verify(root, commit), release)
            with self.assertRaises(ValueError):
                pull.verify(root, 'b' * 40)
            (root / 'site/index.html').write_text('tampered')
            with self.assertRaises(ValueError):
                pull.verify(root, commit)

    def test_reuse_only_hash_matching_public_assets(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as temp:
            base = Path(temp)
            root = base / 'staging'
            root.mkdir()
            previous = base / 'current/site/images'
            previous.mkdir(parents=True)
            (previous / 'photo.png').write_bytes(b'photo')
            name = 'site/images/photo.png'
            (root / 'release.json').write_text(json.dumps({'reusable_files': {name: 'public/images/photo.png'}}))
            (root / 'manifest.json').write_text(json.dumps({name: hashlib.sha256(b'photo').hexdigest()}))
            with patch.object(pull, 'BASE', base), patch.object(pull.subprocess, 'run') as download:
                pull.hydrate(root, 'a' * 40)
                download.assert_not_called()
            self.assertEqual((root / name).read_bytes(), b'photo')
            (root / 'release.json').write_text(json.dumps({'reusable_files': {'../escape': 'public/escape'}}))
            with self.assertRaises(ValueError):
                pull.hydrate(root, 'a' * 40)
