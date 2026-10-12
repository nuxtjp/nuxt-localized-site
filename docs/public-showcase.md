# Public OSS dashboard and product pages

[日本語](public-showcase.ja.md)

`@nuxtjp/localized-site/showcase` owns the feed types, runtime validator and download summaries. `NuxtJpOssShowcase` renders a validated feed with slots and CSS variables. The same data can be linked at its owner site or rendered with a consumer's theme. It introduces no cross-organization runtime dependency, authentication or live network request.

```ts
import { validateShowcaseFeed, summarizeDownloads } from '@nuxtjp/localized-site/showcase'
const feed = validateShowcaseFeed(publicOwnerFeed)
const groups = summarizeDownloads(feed, Date.now())
```

```vue
<NuxtJpOssShowcase :feed="feed" locale="en" :now="observedNow">
  <template #heading="{ owner }"><h1>{{ owner }}</h1></template>
  <template #entry="{ entry }"><NuxtLink :to="`/products/${entry.id}`">Details</NuxtLink></template>
</NuxtJpOssShowcase>
```

The component accepts `entry-id` for an individual OSS or product page; the consumer owns routes, head/SEO, approved content and domain binding. Theme variables are `--showcase-text`, `--showcase-background`, `--showcase-card`, `--showcase-border` and `--showcase-accent`. Do not make unrelated marketing pages depend on projection workers: this static presentation needs no worker authority or persistent store.

The opt-in playground at `/oss` and `/oss/workspace?lang=en` shows dashboard/catalog, details/product LP, English/Japanese content, consumer theme, unavailable statistics and stale observations. It runs offline with synthetic values; no real organizations' private content is included. Run `pnpm build` and `node playground/.output/server/index.mjs` with `NITRO_HOST=127.0.0.1` and an unused `NITRO_PORT`.

## Feed and metrics rules

Use schema `nuxtjp://showcase/v1`. Supply both Japanese and English copy. Missing translations, extra fields, credentials in URLs, private product repository fields, invalid dates, duplicate package/period observations and unsafe totals are rejected. OSS entries carry a GitHub repository and license; private products expose presentation links and carry neither source URLs nor download statistics. The validator checks shape; the publishing owner must verify a public repository/license allowlist before generating a feed. It does not infer that a GitHub URL is public or grant permission to redistribute source.

Every metric carries registry, package, exact inclusive date range, observation time, source and status. npm sources identify their exact package/date-range endpoint; crates.io sources identify the exact crate downloads endpoint. A collector must derive the declared period from dated crate observations. Counts from different registries or periods are separate groups. `unavailable` uses `downloads: null`; measured zero uses `available` and `0`. Default freshness is 48 hours; callers can provide another finite nonnegative maximum age. Future observations are stale. Partial groups explicitly count unavailable/stale records, and a group with no available records renders a dash.

Data acquisition belongs in each owner's reviewed build/collection workflow. Use only public repository and registry information, without user tokens or private operational inventories. Fetch bounded responses, retain last verified feed with its real observation time on failure, validate before writing, and promote only the approved static artifact. The Coela theme can render this public feed independently. Each owner retains its own deployment/rollback and need not wait for CoelaRelease.

## Release and deployment gates

The 0.2.0 candidate retains the existing staged-publication workflow. The reviewed source SHA must match `REGISTRY_SECURITY_APPROVED_SHA`, and the release tag must match the package version. The source/archive approval precedes OIDC staging; the npm owner then approves the exact staged package with 2FA. A CI archive is not a published release. Keep the Trusted Publisher workflow/environment binding unchanged. Switching site consumers to 0.2.0 and production deployment follows official archive verification and each site's existing content/host approvals.
