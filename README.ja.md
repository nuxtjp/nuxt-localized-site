# @nuxtjp/localized-site

[English](README.md)

日本語・英語の紹介サイトを、1つの検証済み設定から構成します。`/`、`/docs`、`/docs/getting-started`、`/docs/security`と各英語ページを生成し、言語切替とSEOを適用します。

## 導入と設定

`0.1.0`はnpmで公開済みです。Node.js 22.19以降または24.11以降、Nuxt 4.5.1以降の4系、Vue `^3.5.40`を使用してください。

```sh
pnpm add --save-exact @nuxtjp/localized-site@0.1.0 nuxt@4.5.1 vue@3.5.43
```

```ts
export default defineNuxtConfig({
  modules: [['@nuxtjp/localized-site', { contentRoot: '.' }]]
})
```

`contentRoot`を明示します。[汎用設定サンプル](examples/content/site.config.json)を、そのディレクトリに`site.config.json`として置き、サイト固有の内容に置き換えてください。
`siteId`、`serviceId`、`origin`、`audienceScope`、完全なja/enコンテンツ、ちょうど3つのfeatures、導入・セキュリティ文書、privacy/contact説明、`externalActions: false`が必須です。

```sh
pnpm exec nuxtjp-localized-site validate --content-root .
pnpm exec nuxt build
```

## 動作と制約

privacy/contactは説明文として表示し、未設定のリンクや操作を生成しません。
メンテナンス表示は、ブラウザから同一originの`/maintenance.json`を読みます。取得・形式・期限の検証に失敗した場合は表示せず、サイト本文と言語切替は利用できます。
配布物だけを試す場合は、registry版の代わりに承認された正確なTGZを導入してください。この手順はサイトの公開やregistry設定を行いません。

## 型付きメッセージ

```ts
const messages = defineLocalizedMessages({
  ja: { save: '保存', cancel: 'キャンセル' },
  en: { save: 'Save', cancel: 'Cancel' }
})
const { t } = useLocalizedMessages(messages)
t('save')
```

英語のキーは日本語と一致させます。空のメッセージは`fallbackLocale`、次に`defaultLocale`へfallbackします。

## 開発

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm validate:example
pnpm pack
```

`prepack`はテスト、型検査、build、サンプル検証を実行します。リリース前に、実際のarchiveを別hostで確認してください。

## 文書とライセンス

[使い方](https://github.com/nuxtjp/nuxt-localized-site/blob/main/docs/getting-started.md) · [Schema](schemas/localized-site-v1.schema.json) · [テスト](https://github.com/nuxtjp/nuxt-localized-site/tree/main/test) · [セキュリティ報告](https://github.com/nuxtjp/nuxt-localized-site/blob/main/SECURITY.md)

コードは[Apache-2.0](LICENSE)です。[LICENSE-PREVIOUS](LICENSE-PREVIOUS)に以前の許諾、[NOTICE](NOTICE)に帰属表示を保持します。
[LICENSE-ASSETS](LICENSE-ASSETS)は対象となるブランド・コンテンツ素材の別条件を保持します。コードのライセンスを変更せず、第三者やサイト所有者のコンテンツの権利を追加で許諾するものでもありません。
