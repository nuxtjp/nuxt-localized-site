import json, os, re, subprocess, tomllib, urllib.error, urllib.parse, urllib.request
from pathlib import Path

def require(condition, message):
    if not condition:
        raise ValueError(message)


expected_repo = 'nuxtjp/site-builder'
expected_name = '@nuxtjp/localized-site'
expected_version = '0.2.1'
mode = os.environ['RELEASE_MODE']
sha = os.environ['GITHUB_SHA']
if mode not in ('prepare', 'oidc'):
    raise ValueError('Only prepare or oidc release modes are supported')
require(os.environ['GITHUB_REPOSITORY'] == expected_repo, 'Release approval or identity mismatch')
require(re.fullmatch('[a-f0-9]{40}', sha), 'Release approval or identity mismatch')
require(os.environ.get('APPROVED_SHA') == sha, 'Release approval or identity mismatch')
require(os.environ.get('GITHUB_REF_TYPE') == 'tag', 'Release approval or identity mismatch')
require(os.environ.get('GITHUB_REF_NAME') == 'v' + expected_version, 'Release approval or identity mismatch')
event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
require(event['repository']['private'] is False, 'Release approval or identity mismatch')
require(event['repository']['full_name'] == expected_repo, 'Release approval or identity mismatch')
require(subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == sha, 'Release approval or identity mismatch')
subprocess.run(['git', 'merge-base', '--is-ancestor', sha, 'origin/main'], check=True)
require(not subprocess.check_output(['git', 'status', '--porcelain', '--untracked-files=no']).strip(), 'Release approval or identity mismatch')
if Path('package.json').exists():
    package = json.loads(Path('package.json').read_text())
    require(package.get('private') is not True, 'Release approval or identity mismatch')
    require(package.get('publishConfig', {}).get('access') == 'public', 'Release approval or identity mismatch')
    require(package.get('publishConfig', {}).get('registry', 'https://registry.npmjs.org') == 'https://registry.npmjs.org', 'Release approval or identity mismatch')
    url = 'https://registry.npmjs.org/' + urllib.parse.quote(expected_name, safe='')
else:
    package = tomllib.loads(Path('Cargo.toml').read_text())['package']
    require(package.get('publish') == ['crates-io'], 'Release approval or identity mismatch')
    url = 'https://crates.io/api/v1/crates/' + expected_name
require(package['name'] == expected_name and package['version'] == expected_version, 'Release approval or identity mismatch')
if mode != 'prepare':
    require(os.environ.get('PUBLISH_ENABLED') == 'true', 'Release approval or identity mismatch')
    req = urllib.request.Request(url, headers={'User-Agent': expected_repo + ' release-preflight'})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            metadata = json.load(response)
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
        metadata = None
    require(metadata is not None, 'OIDC requires an existing package and configured trust')
    versions = metadata.get('versions', {})
    exists = expected_version in versions if isinstance(versions, dict) else any(v['num'] == expected_version for v in versions)
    require(not exists, 'Version already exists; inspect registry metadata/integrity')
print('Approved source, identity and release mode verified')
