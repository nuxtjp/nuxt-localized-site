export function organizationSites(root: string): string[];
export function siteDirectory(root: string, key: string): string;
export function organizationSite(configUrl: string, key?: string): {
  srcDir: string;
  devtools: { enabled: boolean };
  buildDir: string;
  dir: { public: string };
  modules: [string, { contentRoot: string; maintenance: boolean }][];
  nitro: { output: { dir: string }; prerender: { failOnError: boolean } };
};
export function checkPublicCatalog(policy: unknown, catalog: unknown): { scope: string; entries: number };
export function checkSitePublication(root: string, key: string): { scope: string; entries: number } | null;

export function loadOrganizationShowcase(contentRoot: string, snapshotName?: 'showcase.json' | 'organizations.json'): Promise<import('../validator/showcase/index.js').ShowcaseFeed | null>;
