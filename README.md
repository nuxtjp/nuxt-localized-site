# @nuxtjp/localized-site

[日本語](README.ja.md)

Generate a Japanese/English introduction site from one validated configuration. The module supplies `/`, `/docs`, `/docs/getting-started`, `/docs/security` and their English counterparts, locale links and SEO metadata.

## Install and configure

Version `0.1.0` is published on npm. Use Node.js 22.19+ or 24.11+, Nuxt 4.5.1+ in major 4, and Vue `^3.5.40`.

```sh
pnpm add --save-exact @nuxtjp/localized-site@0.1.0 nuxt@4.5.1 vue@3.5.43
```

```ts
export default defineNuxtConfig({
  modules: [['@nuxtjp/localized-site', { contentRoot: '.' }]]
})
```

Set `contentRoot` explicitly. Copy the [generic configuration](examples/content/site.config.json) there as `site.config.json`, and replace it with the site's own content.
The configuration requires `siteId`, `serviceId`, `origin`, `audienceScope`, complete ja/en content, exactly three features, getting-started and security documents, privacy/contact notices, and `externalActions: false`.

```sh
pnpm exec nuxtjp-localized-site validate --content-root .
pnpm exec nuxt build
```

## Behavior and limits

Privacy/contact notices are text. The module creates no unset links or actions.
In the browser, the optional maintenance notice reads same-origin `/maintenance.json`. Failed retrieval, invalid data or expired data hides that notice; the site and locale switching remain usable.
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

## Development

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm validate:example
pnpm pack
```

`prepack` runs tests, typecheck, build and example validation. Verify the actual archive in a separate host before a release.

## Documentation and license

[Usage guide](https://github.com/nuxtjp/nuxt-localized-site/blob/main/docs/getting-started.md) · [Schema](schemas/localized-site-v1.schema.json) · [Tests](https://github.com/nuxtjp/nuxt-localized-site/tree/main/test) · [Security reporting](https://github.com/nuxtjp/nuxt-localized-site/blob/main/SECURITY.md)

Code: [Apache-2.0](LICENSE). [LICENSE-PREVIOUS](LICENSE-PREVIOUS) retains prior grants, and [NOTICE](NOTICE) preserves attribution.
[LICENSE-ASSETS](LICENSE-ASSETS) retains separate terms for covered brand/content assets. It does not change the code license or grant rights to third-party or site-owned content.

## Consumer dependency security

See [dependency security backports](security/README.md) before installing this package in a Nuxt application. pnpm consumers must explicitly apply the included backports and verify their locked dependency tree; ordinary npm installation does not apply them.
