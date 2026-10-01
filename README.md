# @nuxtjp/localized-site

A contract-first Nuxt module for small Japanese and English public service
sites. It validates one local `site.config.json`, then injects the layout,
runtime, SEO metadata, and four pages:

- `/`
- `/docs`
- `/docs/getting-started`
- `/docs/security`

The non-default locale is prefixed by default, such as `/en/docs`. Setting
`prefixDefaultLocale` to `true` prefixes both `ja` and `en`.

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

## Validation

The CLI never searches sibling repositories. A content root is mandatory:

```bash
pnpm exec nuxtjp-localized-site validate --content-root ./content
```

Validation rejects unknown fields, incomplete locales, mismatched feature or
section identifiers, unsafe identifiers, incorrect document slugs, executable
external-action declarations, and invalid origins.

## Public maintenance notice

The shared layout reads same-origin `/maintenance.json` after mount and shows
the global or matching `serviceId` notice. The closed
[`public-maintenance-state-v1`](schemas/public-maintenance-state-v1.schema.json)
contract contains only bounded Japanese and English messages. Missing,
unreachable, unknown-field, duplicate-service, or expired documents do not
block the site. Cross-origin status endpoints and credentials are unsupported.

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

## URL and SEO policy

The active URL determines `<html lang>`. The module emits one canonical link,
`ja`, `en`, and `x-default` hreflang links, plus description and Open Graph
metadata. Query strings and fragments do not enter canonical URLs.

## Local verification

```bash
pnpm install --offline --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm validate:example
pnpm pack
```

The playground is a real minimal Nuxt host using only the module and example
contract. The package performs no fetch, provider access, discovery, external
write, or implicit content-root selection.
