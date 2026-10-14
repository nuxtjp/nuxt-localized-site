# Organization sites and personal portfolios

Use a common accessible, bilingual editorial composition with an explicit theme and scope. Themes provide a paper/ink/accent palette; NuxtJP emphasizes interface composition, vPremises environment layers, and Crowsi permission boundaries. These are conceptual illustrations, not product screenshots.

```ts
organizationSite(import.meta.url, process.env.SITE_ID, {
  theme: 'vpremises', scope: 'organization'
})
```

A direct Nuxt consumer passes `presentation: { theme: 'nuxtjp', scope: 'organization' }` alongside `contentRoot`. Omit presentation to retain the standard rendering. Theme selection never infers domain ownership or changes deployment settings.

`portfolio` renders the organization directory plus overall/per-organization download summaries. It does not generate individual repository detail pages. Directory IDs are explicitly `<GitHub-owner>-site`; they group reviewed public sources by the owner segment of their repository URLs. The Coela self-link and unassigned `.invalid` hosts are excluded. `organization` renders its own repository list, package observations and detail pages. Actual deployment/acceptance remains a separate operation; a configured site link is not proof that the domain has been released.

All consumers use the same `nuxtjp://showcase/v1` data contract. Each organization owns its public snapshot; Coela merges those snapshots and does not invent a second copy of metrics. Existing validation rejects duplicate registry/package/period keys across entries. Totals are separate per registry and exact period, include only available fresh observations, and explicitly state partial coverage. Missing observations are never measured zeros; downloads are not unique users. Do not turn non-published crates or private products into public packages or fabricate product capabilities.

Collection happens in trusted build/maintenance code via the existing public collectors, never browser account credentials. Retain source URLs, dates and coverage. Private registries, tokens and operational profiles do not enter snapshots. Use reviewed data updates and the ordinary version/tag/source CI paths for independent repositories.

The common module owns layout, typography, catalog and aggregation. Personal narrative and project selection stay in the portfolio consumer; organization and service content stays with its owning site repository. A product LP can use its organization theme without moving proprietary source into the common module.
