<script setup lang="ts">
import { computed, ref } from 'vue'
import fixture from '../../data/showcase.json'
import { validateShowcaseFeed } from '@nuxtjp/localized-site/showcase'
const locale = ref<'ja' | 'en'>('ja'), mode = ref('fresh')
const feed = computed(() => {
  const result = validateShowcaseFeed(fixture)
  if (mode.value === 'unavailable') {
    const metric = result.entries[0]!.metrics[0]!
    metric.status = 'unavailable'; metric.downloads = null
  }
  return result
})
const now = computed(() => Date.parse(mode.value === 'stale' ? '2026-10-12T00:00:00Z' : fixture.observedAt))
</script>
<template>
  <main class="coela-theme">
    <p>Local synthetic playground · no account connection or registry request</p>
    <label>Language <select v-model="locale"><option value="ja">日本語</option><option value="en">English</option></select></label>
    <label>Metrics <select v-model="mode"><option value="fresh">Fresh</option><option value="unavailable">Unavailable</option><option value="stale">Stale</option></select></label>
    <NuxtJpOssShowcase :feed="feed" :locale="locale" :now="now">
      <template #heading="{ owner }"><h1>{{ owner }}</h1><p>Owner content rendered with a consumer theme</p></template>
      <template #entry="{ entry }"><NuxtLink :to="`/oss/${entry.id}?lang=${locale}`">{{ locale === 'ja' ? '詳しく見る' : 'Details' }}</NuxtLink></template>
    </NuxtJpOssShowcase>
  </main>
</template>
<style scoped>
.coela-theme { --showcase-accent: #17634b; --showcase-background: #edf6f1; --showcase-border: #abcbbb; max-width: 75rem; margin: auto; }
label { display: inline-block; margin: 1rem; }
</style>
