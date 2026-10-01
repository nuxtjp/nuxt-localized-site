<script setup lang="ts">
import { useLocalizedSite } from '../composables/useLocalizedSite'

const site = useLocalizedSite()
</script>

<template>
  <nav
    class="nls-language-switcher"
    :aria-label="site.locale.value === 'ja' ? '言語' : 'Language'"
  >
    <NuxtLink
      v-for="locale in site.supportedLocales"
      :key="locale"
      :to="site.localePath(locale)"
      :lang="locale"
      :aria-current="locale === site.locale.value ? 'page' : undefined"
    >
      {{ locale === 'ja' ? '日本語' : 'English' }}
    </NuxtLink>
  </nav>
</template>
