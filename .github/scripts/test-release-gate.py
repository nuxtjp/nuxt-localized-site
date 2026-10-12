"""Verify retired release modes fail before any git or registry access."""

import os
from pathlib import Path
import subprocess
import sys
import unittest


class ReleaseModeTests(unittest.TestCase):
    def test_wrong_repository_is_rejected_even_with_optimized_python(self):
        script = Path(__file__).with_name('release-gate.py')
        for mode in ('prepare', 'oidc'):
            for flags in ([], ['-O']):
                with self.subTest(mode=mode, flags=flags):
                    result = subprocess.run(
                        [sys.executable, *flags, str(script)],
                        env={**os.environ, 'RELEASE_MODE': mode, 'GITHUB_SHA': 'a' * 40,
                             'GITHUB_REPOSITORY': 'untrusted/other'},
                        capture_output=True, text=True, check=False,
                    )
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn('Release approval or identity mismatch', result.stderr)

    def test_retired_and_unknown_modes_are_rejected(self):
        script = Path(__file__).with_name('release-gate.py')
        for mode in ('bootstrap', 'publish', ''):
            for flags in ([], ['-O']):
                with self.subTest(mode=mode, flags=flags):
                    result = subprocess.run(
                        [sys.executable, *flags, str(script)],
                        env={**os.environ, 'RELEASE_MODE': mode, 'GITHUB_SHA': 'a' * 40},
                        capture_output=True, text=True, check=False,
                    )
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn('Only prepare or oidc release modes are supported', result.stderr)


if __name__ == '__main__':
    unittest.main()
