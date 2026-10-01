declare module '#imports' {
  export function defineNuxtPlugin(plugin: () => void): unknown
  export const useLocalizedSite: typeof import(
    '../app/composables/useLocalizedSite'
  ).useLocalizedSite
  export function useHead(
    input: () => import('../core/seo').LocalizedHead
  ): void
  export function useRoute(): {
    path: string
    fullPath: string
  }
  export function useRuntimeConfig(): {
    public: {
      nuxtJpLocalizedSite: import('../../contracts/types').ResolvedSiteConfig
    }
  }
}
