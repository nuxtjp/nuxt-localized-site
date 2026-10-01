import { defineNuxtPlugin, useHead, useRoute, useRuntimeConfig } from '#imports'
import { localizedHead } from '../../core/seo'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const config = useRuntimeConfig().public.nuxtJpLocalizedSite
  useHead(() => localizedHead(route.path, config))
})
