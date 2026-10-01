import { computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import type { SupportedLocale } from '../../../contracts/types'
import {
  localeFromPath,
  localePath as buildLocalePath,
  pageIdFromPath
} from '../../core/path'

export function useLocalizedSite() {
  const route = useRoute()
  const config = useRuntimeConfig().public.nuxtJpLocalizedSite
  const locale = computed(() => localeFromPath(route.path, config.defaultLocale))
  const content = computed(() => config.content[locale.value])
  const pageId = computed(() => pageIdFromPath(route.path))

  function localePath(localeValue: SupportedLocale, path = route.fullPath): string {
    return buildLocalePath(path, localeValue, config)
  }

  return {
    config,
    content,
    locale,
    localePath,
    pageId,
    supportedLocales: config.locales
  }
}
