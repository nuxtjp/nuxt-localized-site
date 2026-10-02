# @nuxtjp/localized-site

設定ファイルから日本語・英語の紹介、導入、セキュリティ案内ページを構成できます。

## 利用前の確認

実装済みの範囲、必要な依存関係、検証コマンドを以下の英語説明に併記しています。操作・配備・公開は、それぞれの権限と設定を確認してから実施してください。

## 導入・使い方

以下は現行インターフェースの利用例です。ローカル成果物の参照がある場合は、必要な版の成果物を先に準備してください。パッケージの公開配布は今回の作業では行いません。

## Typed messages

Consumer-specific UI messages can share the same fallback policy:

```ts
const messages = defineLocalizedMessages({
  ja: { save: '保存', cancel: 'キャンセル' },
  en: { save: 'Save', cancel: 'Cancel' }
})

const { t } = useLocalizedMessages(messages)
t('save')
```

Missing or extra English keys fail TypeScript validation. At runtime an empty
current-locale message falls back to `fallbackLocale`, then `defaultLocale`.

## English

Build a small Japanese/English service website from one validated content configuration.

## What you can do

- Generate overview, documentation, getting-started and security pages.
- Apply locale routing, layout and SEO metadata.

## Current scope

Content is caller-owned data. Distribution of the versioned package is not activated yet; source preparation is separate from publishing a site.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

Use `pnpm@10.29.3` and the Node.js version declared in `engines` in `package.json`. Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm validate:example
pnpm typecheck
pnpm test
pnpm build:module
```

## Examples and interface details

## Consumer

Store a versioned package artifact in the consumer rather than adding a source
path dependency:

```bash
pnpm add ./vendor/nuxtjp-localized-site-0.1.0.tgz
```

The complete consumer configuration is intentionally small:

```ts
export default defineNuxtConfig({
  modules: [['@nuxtjp/localized-site', {
    contentRoot: '.'
  }]]
})
```

Place `site.config.json` at the declared content root. The contract requires:

- `siteId`, `serviceId`, `origin`, and `audienceScope`;
- a site-declared `defaultLocale` and exact `locales: ["ja", "en"]`;
- localized brand, tagline, summary, and exactly three features;
- localized overview, getting-started, and security documents;
- localized privacy and contact notices;
- `externalActions: false`.

See [the complete example](examples/content/site.config.json) and the
[published schema](schemas/localized-site-v1.schema.json).

## Documentation and source

[Usage guide](docs/getting-started.md)

[Examples](examples) · [Schemas](schemas) · [Implementation and public interfaces](src) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)
