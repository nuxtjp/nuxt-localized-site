set -euo pipefail
export NUXT_TELEMETRY_DISABLED=1 CI=true
export NPM_CONFIG_USERCONFIG="$RUNNER_TEMP/empty.npmrc"
export NPM_CONFIG_GLOBALCONFIG="$RUNNER_TEMP/empty-global.npmrc"
export npm_config_registry=https://registry.npmjs.org
touch "$NPM_CONFIG_USERCONFIG" "$NPM_CONFIG_GLOBALCONFIG"
npm install --global npm@12.2.0
mkdir -p "$RUNNER_TEMP/package-release"
MANAGER=$(node -p 'require("./package.json").packageManager')
if test "$MANAGER" = pnpm@10.29.3; then
  npm install --global pnpm@10.29.3
  pnpm install --frozen-lockfile --ignore-scripts
  pnpm run build:validator
  pnpm run build:module
  pnpm exec nuxt prepare playground
  pnpm test
  pnpm typecheck
  pnpm build
  pnpm validate:example
  npm pack --ignore-scripts --json --pack-destination "$RUNNER_TEMP/package-release" > "$RUNNER_TEMP/package-pack.json"
else
  test "$MANAGER" = npm@12.2.0
  npm ci --ignore-scripts
  npm pack --json --pack-destination "$RUNNER_TEMP/package-release" > "$RUNNER_TEMP/package-pack.json"
fi
python3 scripts/check-public-package.py npm --archive "$RUNNER_TEMP/package-release/nuxtjp-localized-site-0.2.1.tgz"
pnpm exec playwright install --with-deps chromium
node .github/scripts/package-consumer.mjs "$RUNNER_TEMP/package-release/nuxtjp-localized-site-0.2.1.tgz"
:

node .github/scripts/package-consumer-security.mjs "$RUNNER_TEMP/package-release/nuxtjp-localized-site-0.2.1.tgz" @nuxtjp/localized-site
