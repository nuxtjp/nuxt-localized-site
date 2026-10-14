<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig, useLocalizedSite } from '#imports'
import { presentationThemes, type PresentationOptions } from '@nuxtjp/localized-site/core'
const site = useLocalizedSite()
const presentation = useRuntimeConfig().public.nuxtJpPresentation as PresentationOptions
const palette = presentationThemes[presentation.theme]
const ja = computed(() => site.locale.value === 'ja')
const style = { '--editorial-accent': palette.accent, '--editorial-paper': palette.paper, '--editorial-ink': palette.ink }
</script>
<template>
  <div class="editorial-shell" :style="style">
    <a class="editorial-skip" href="#main-content">{{ ja ? '本文へ' : 'Skip to content' }}</a>
    <header class="editorial-header editorial-wrap">
      <NuxtLink class="editorial-brand" :to="site.localePath(site.locale.value, '/')">{{ site.content.value.brand }}<span aria-hidden="true">·</span></NuxtLink>
      <nav :aria-label="ja ? '主要メニュー' : 'Main navigation'">
        <NuxtLink :to="site.localePath(site.locale.value, '/')">{{ ja ? '紹介' : 'About' }}</NuxtLink>
        <NuxtLink :to="site.localePath(site.locale.value, '/oss')">{{ ja ? 'OSS' : 'OSS' }}</NuxtLink>
        <NuxtJpLocalizedLanguageSwitcher />
      </nav>
    </header>
    <main id="main-content" class="editorial-wrap editorial-main"><NuxtJpPublicMaintenanceNotice /><slot /></main>
    <footer class="editorial-footer editorial-wrap"><strong>{{ site.content.value.brand }}</strong><NuxtLink :to="site.localePath(site.locale.value, '/docs')">{{ ja ? 'ガイド' : 'Guide' }}</NuxtLink><a v-if="presentation.scope === 'organization'" href="https://coela.org">Coela ↗</a><span v-else>{{ ja ? 'Coelaの視点で選ぶ、コードとアイデア。' : 'Code and ideas, from Coela’s perspective.' }}</span></footer>
  </div>
</template>
