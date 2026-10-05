import { resolve } from 'node:path'
import {
  addComponent,
  addImports,
  addLayout,
  addPlugin,
  addPrerenderRoutes,
  createResolver,
  defineNuxtModule,
  extendPages
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import type { ResolvedSiteConfig } from './contracts/types'
import { siteRoutes } from './runtime/core/path'

export interface ModuleOptions {
  contentRoot?: string
}

interface ValidatorModule {
  loadSiteConfig(contentRoot: string): ResolvedSiteConfig
}

// CLI and Nuxt setup share one packaged validator without duplicating its bundle.
async function loadValidator(): Promise<ValidatorModule> {
  const validatorUrl = new URL('../validator/content/index.js', import.meta.url)
  return await import(validatorUrl.href) as ValidatorModule
}

const localizedSiteModule: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjp/localized-site',
    configKey: 'nuxtJpLocalizedSite',
    compatibility: { nuxt: '^4.5.1' }
  },
  defaults: {},
  async setup(options, nuxt) {
    if (!options.contentRoot) {
      throw new Error('nuxtJpLocalizedSite.contentRoot must be declared explicitly')
    }
    const { loadSiteConfig } = await loadValidator()
    const config = loadSiteConfig(resolve(nuxt.options.rootDir, options.contentRoot))
    const resolver = createResolver(import.meta.url)
    const pageFile = resolver.resolve('./runtime/app/pages/LocalizedContentPage.vue')
    const routes = siteRoutes(config)

    nuxt.options.runtimeConfig.public.nuxtJpLocalizedSite = config
    addLayout(resolver.resolve('./runtime/app/layouts/localized-site.vue'), 'localized-site')
    addComponent({
      name: 'NuxtJpLocalizedLanguageSwitcher',
      filePath: resolver.resolve(
        './runtime/app/components/LocalizedLanguageSwitcher.vue'
      )
    })
    addComponent({
      name: 'NuxtJpPublicMaintenanceNotice',
      filePath: resolver.resolve(
        './runtime/app/components/PublicMaintenanceNotice.vue'
      )
    })
    addPlugin(resolver.resolve('./runtime/app/plugins/localized-head'))
    addImports([
      {
        name: 'useLocalizedSite',
        from: resolver.resolve('./runtime/app/composables/useLocalizedSite')
      },
      {
        name: 'useLocalizedMessages',
        from: resolver.resolve('./runtime/app/composables/useLocalizedMessages')
      },
      {
        name: 'defineLocalizedMessages',
        from: resolver.resolve('./runtime/core/messages')
      }
    ])
    extendPages(pages => {
      const occupied = new Set(pages.map(page => page.path))
      for (const [index, path] of routes.entries()) {
        if (occupied.has(path)) {
          throw new Error(`@nuxtjp/localized-site route conflicts with consumer page: ${path}`)
        }
        pages.push({
          name: `nuxtjp-localized-site-${index}`,
          path,
          file: pageFile,
          meta: { layout: 'localized-site' }
        })
      }
    })
    addPrerenderRoutes(routes)
    const stylesheet = resolver.resolve('./runtime/app/assets/localized-site.css')
    if (!nuxt.options.css.includes(stylesheet)) nuxt.options.css.push(stylesheet)
  }
})

export default localizedSiteModule
export type {
  ResolvedSiteConfig,
  SiteConfig,
  SupportedLocale
} from './contracts/types'
