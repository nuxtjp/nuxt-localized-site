<script setup lang="ts">
import { computed } from 'vue'
import { summarizeDownloads, validateShowcaseFeed } from '@nuxtjp/localized-site/showcase'
import type { Locale } from '@nuxtjp/localized-site/showcase'
const props = defineProps<{ feed: unknown; locale: Locale; now: number }>()
const snapshot = computed(() => validateShowcaseFeed(props.feed))
const groups = computed(() => summarizeDownloads(snapshot.value, props.now))
</script>
<template>
  <section class="download-summary" :aria-label="locale === 'ja' ? 'ダウンロードの集計' : 'Download summary'">
    <article v-for="group in groups" :key="`${group.registry}:${group.start}:${group.end}`">
      <p class="editorial-eyebrow">{{ group.registry }} / {{ group.start }} — {{ group.end }}</p>
      <strong>{{ group.available ? group.downloads.toLocaleString(locale) : '—' }}</strong>
      <p>{{ locale === 'ja' ? '取得済みパッケージのダウンロード合計' : 'Downloads across observed packages' }}</p>
      <small>{{ locale === 'ja' ? '取得済み' : 'Observed' }} {{ group.available }} · {{ locale === 'ja' ? '未取得' : 'Unavailable' }} {{ group.unavailable }} · {{ locale === 'ja' ? '期限切れ' : 'Stale' }} {{ group.stale }}</small>
    </article>
    <p v-if="!groups.length">{{ locale === 'ja' ? 'このサイトのダウンロード情報は未集計です。' : 'Download observations are not available for this site yet.' }}</p>
    <p class="download-note">{{ locale === 'ja' ? '公開レジストリの期間付きスナップショットです。ダウンロード数は利用者数ではありません。' : 'Dated public-registry observations. Downloads are not unique users.' }}</p>
  </section>
</template>
