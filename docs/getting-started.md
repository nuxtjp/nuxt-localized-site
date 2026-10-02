# Using @nuxtjp/localized-site

Build a small Japanese/English service website from one validated content configuration.

## Before you start

Content is caller-owned data. Distribution of the versioned package is not activated yet; source preparation is separate from publishing a site.

## First steps

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm validate:example
pnpm typecheck
pnpm test
pnpm build:module
```

## How to assess the result

- Generate overview, documentation, getting-started and security pages.
- Apply locale routing, layout and SEO metadata.

A passing source-level check establishes only what that check observes. Keep missing configuration, unavailable services and unverified deployment paths visible.

## Continue reading

[Repository overview](../README.md)
