<script setup lang="ts">
import { computed } from 'vue'
import { metricState, summarizeDownloads, validateShowcaseFeed } from '@nuxtjp/localized-site/showcase'
import type { Locale } from '@nuxtjp/localized-site/showcase'
const props = defineProps<{ feed: unknown; locale: Locale; now: number; maxAgeMs?: number; entryId?: string; kindLabel?: string }>()
const feed = computed(() => validateShowcaseFeed(props.feed))
const entries = computed(() => feed.value.entries.filter(entry => !props.entryId || entry.id === props.entryId))
const groups = computed(() => summarizeDownloads({ ...feed.value, entries: entries.value }, props.now, props.maxAgeMs))
const labels = computed(() => props.locale === 'ja'
  ? { available: '取得済み', unavailable: '未取得', stale: '期限切れ', oss: 'OSS', product: '製品', partial: '取得済み分のみ', repository: 'ソース', homepage: '紹介サイト', empty: '該当する紹介はありません' }
  : { available: 'Available', unavailable: 'Unavailable', stale: 'Stale', oss: 'OSS', product: 'Product', partial: 'Available records only', repository: 'Source', homepage: 'Website', empty: 'No matching entries' })
</script>

<template>
  <section class="showcase" :aria-label="feed.owner">
    <header><slot name="heading" :owner="feed.owner"><h1>{{ feed.owner }}</h1></slot>
      <time :datetime="feed.observedAt">{{ feed.observedAt }}</time>
    </header>
    <div class="showcase-metrics">
      <article v-for="group in groups" :key="`${group.registry}:${group.start}:${group.end}`">
        <h2>{{ group.registry }}</h2><p>{{ group.start }} – {{ group.end }}</p>
        <strong>{{ group.available ? group.downloads.toLocaleString(locale) : '—' }}</strong>
        <p>{{ labels.partial }} · {{ labels.available }} {{ group.available }} · {{ labels.unavailable }} {{ group.unavailable }} · {{ labels.stale }} {{ group.stale }}</p>
      </article>
    </div>
    <div class="showcase-grid">
      <article v-for="entry in entries" :key="entry.id">
        <p>{{ kindLabel ?? labels[entry.kind] }}<span v-if="entry.license"> · {{ entry.license }}</span></p>
        <h2>{{ entry.name[locale] }}</h2><p>{{ entry.summary[locale] }}</p>
        <slot name="entry" :entry="entry"><a :href="entry.homepage">{{ labels.homepage }}</a></slot>
        <a v-if="entry.repository" :href="entry.repository">{{ labels.repository }}</a>
        <ul v-if="entry.metrics.length">
          <li v-for="metric in entry.metrics" :key="`${metric.registry}:${metric.package}:${metric.period.start}:${metric.period.end}`">
            <a :href="metric.source">{{ metric.package }}</a> ·
            {{ labels[metricState(metric, now, maxAgeMs)] }}
            <span v-if="metricState(metric, now, maxAgeMs) === 'available'">: {{ metric.downloads?.toLocaleString(locale) }}</span>
          </li>
        </ul>
      </article>
    </div>
    <p v-if="!entries.length">{{ labels.empty }}</p>
  </section>
</template>

<style scoped>
.showcase { color: var(--showcase-text, #17213b); background: var(--showcase-background, #f5f7fc); padding: 1.5rem; font-family: system-ui, sans-serif; }
.showcase-metrics, .showcase-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; margin-block: 1.5rem; }
article { border: 1px solid var(--showcase-border, #ccd3e0); border-radius: .8rem; padding: 1.2rem; background: var(--showcase-card, #fff); min-width: 0; overflow-wrap: anywhere; }
a { color: var(--showcase-accent, #284fb7); display: inline-block; margin-inline-end: 1rem; }
strong { font-size: 2rem; } time { font-size: .85rem; } ul { padding-inline-start: 1rem; }
</style>
