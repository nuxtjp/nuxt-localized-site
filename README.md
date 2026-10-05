# @nuxtjp/localized-site

## 日本語

日本語・英語の紹介サイトを1つの検証済み設定から構成します。
`/`、`/docs`、`/docs/getting-started`、`/docs/security`と各英語ページを生成し、言語切替とSEOを適用します。

公開準備中です。以下のregistry導入は`@nuxtjp/localized-site@0.1.0`の公開確認後に使います。
Node.js 22.19以降または24.11以降、Nuxt 4.5.1以降の4系、Vue `^3.5.40`を使用してください。

```sh
pnpm add --save-exact @nuxtjp/localized-site@0.1.0 nuxt@4.5.1 vue@3.5.43
```

```ts
export default defineNuxtConfig({
  modules: [['@nuxtjp/localized-site', { contentRoot: '.' }]]
})
```

[`site.config.json`の汎用サンプル](examples/content/site.config.json)を指定したcontent rootに置き、サイト固有の内容に置き換えます。
`siteId`、`serviceId`、`origin`、`audienceScope`、ja/enのコンテンツ、3つのfeatures、導入・セキュリティ文書、privacy/contact説明、`externalActions: false`が必須です。

```sh
pnpm exec nuxtjp-localized-site validate --content-root .
pnpm exec nuxt build
```

privacy/contactは説明文として表示し、未設定のリンクや操作を生成しません。
メンテナンス表示はブラウザから同一originの`/maintenance.json`を読みます。取得・形式・期限の検証に失敗した場合は表示せず、本文と言語切替は利用できます。
配布物だけを試す際は、registry版の代わりに承認されたTGZをインストールしてください。サイトの公開やregistry設定はこの手順に含みません。

## English

Generate a Japanese/English introduction site from one validated configuration.
The module supplies landing, overview, getting-started and security pages, locale links and SEO metadata.

Publication is pending. After verifying registry availability, use the installation command above with Node.js 22.19+ or 24.11+, Nuxt 4.5.1+ in major 4, and Vue `^3.5.40`.
Set `contentRoot` explicitly, copy the generic example to that directory as `site.config.json`, replace its content, validate it, then build the host application.
The configuration requires site/service identifiers, origin, audience scope, complete ja/en content, exactly three features, documents and privacy/contact notices, and `externalActions: false`.

Privacy/contact notices are text; the module creates no unset links or actions.
In the browser, the optional maintenance notice reads same-origin `/maintenance.json`. Failed retrieval, invalid data or expired data hides the notice while the site remains usable.
For archive testing, install the exact reviewed TGZ instead of the registry version. These commands do not publish a website or configure registry access.

## Typed messages

```ts
const messages = defineLocalizedMessages({
  ja: { save: '保存', cancel: 'キャンセル' },
  en: { save: 'Save', cancel: 'Cancel' }
})
const { t } = useLocalizedMessages(messages)
t('save')
```

English keys must match Japanese keys. Empty messages fall back to `fallbackLocale`, then `defaultLocale`.

## Development / 開発

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm validate:example
pnpm pack
```

`prepack` runs the tests, typecheck, build and example validation. Verify the actual archive in a separate host before release.
See [usage](docs/getting-started.md), [schema](schemas/localized-site-v1.schema.json), [tests](test), and [security reporting](SECURITY.md).

Code: [Apache-2.0](LICENSE). Retained prior grants: [LICENSE-PREVIOUS](LICENSE-PREVIOUS). [NOTICE](NOTICE) preserves attribution.
[LICENSE-ASSETS](LICENSE-ASSETS) retains separate terms for covered brand/content assets; it does not change the code license or grant rights to third-party/site-owned content.
