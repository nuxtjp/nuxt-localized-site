<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRuntimeConfig, useHead } from '#imports'
import { validateShowcaseFeed } from '@nuxtjp/localized-site/showcase'
import { useLocalizedSite } from '../composables/useLocalizedSite'
const site = useLocalizedSite(), route = useRoute()
const original = validateShowcaseFeed(JSON.parse(useRuntimeConfig().public.nuxtJpOssShowcase ?? 'null'))
const organizationSnapshot = useRuntimeConfig().public.nuxtJpOrganizationShowcase
const organizations = organizationSnapshot ? validateShowcaseFeed(JSON.parse(organizationSnapshot)) : null
const query = ref(''), now = Date.now()
const entryId = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  const index = parts.indexOf('oss')
  return parts[index + 1]
})
const selected = computed(() => original.entries.find(entry => entry.id === entryId.value))
const feed = computed(() => ({ ...original, entries: original.entries.filter(entry =>
  (!entryId.value || entry.id === entryId.value) &&
  `${entry.id} ${entry.repository ?? ''} ${entry.name.ja} ${entry.name.en} ${entry.summary.ja} ${entry.summary.en}`.toLowerCase().includes(query.value.toLowerCase())) }))
const ja = computed(() => site.locale.value === 'ja')
useHead(() => {
  const title = `${selected.value?.name[site.locale.value] ?? (ja.value ? 'OSS・モジュール' : 'OSS & modules')} · ${site.content.value.brand}`
  const description = selected.value?.summary[site.locale.value] ?? site.content.value.summary
  return { title, meta: [{ name: 'description', content: description },
    { property: 'og:title', content: title }, { property: 'og:description', content: description }] }
})
</script>
<template>
  <article class="oss-page">
    <header class="oss-intro">
      <p>{{ original.owner }}</p>
      <h1>{{ selected?.name[site.locale.value] ?? (ja ? '公開コードから、次の選択を。' : 'Choose your next building block.') }}</h1>
      <p>{{ ja ? '正本・公開仕様・利用状況を確かめ、改善案を各ownerへ届ける。' : 'Explore canonical sources, public interfaces and adoption, then give feedback to the owner.' }}</p>
      <p>{{ ja ? '数値は期間付きの公開スナップショットです。未取得・期限切れと0件を区別します。' : 'Counts are dated public snapshots. Unavailable and stale observations are distinct from zero.' }}</p>
      <NuxtLink v-if="entryId" :to="site.localePath(site.locale.value, '/oss')">{{ ja ? '一覧へ' : 'All modules' }}</NuxtLink>
      <a v-if="organizations && !entryId" href="#organizations">{{ ja ? '組織の紹介サイトへ' : 'Explore organization sites' }}</a>
      <label v-if="!entryId">{{ ja ? '名前・用途で探す' : 'Search names and purposes' }}
        <input v-model="query" type="search" maxlength="200" :placeholder="ja ? '例：文書、権限、Nuxt' : 'Documents, permissions, Nuxt'">
      </label>
    </header>
    <NuxtJpOssShowcase data-showcase="modules" :feed="feed" :locale="site.locale.value" :now="now">
      <template #heading="{ owner }"><h2>{{ owner }}</h2></template>
      <template #entry="{ entry }">
        <NuxtLink v-if="!entryId" :to="site.localePath(site.locale.value, `/oss/${entry.id}`)">{{ ja ? '役割・利用情報' : 'Role & adoption' }}</NuxtLink>
        <template v-else>
          <a :href="entry.homepage">{{ ja ? '公開ドキュメント' : 'Public documentation' }}</a>
          <p>{{ ja ? '利用する際はownerのREADME・LICENSE・公開版と受入条件を確認してください。' : 'Review the owner README, license, available release and acceptance requirements before adoption.' }}</p>
          <a v-if="entry.repository" :href="`${entry.repository}/issues`">{{ ja ? '改善案・不具合を伝える' : 'Feedback & issues' }}</a>
          <p>{{ ja ? '対象URL・package版・再現手順を添えてください。秘密鍵・token・実顧客データは送らないでください。' : 'Include the page URL, package version and reproduction steps. Do not share tokens, keys or customer data.' }}</p>
        </template>
      </template>
    </NuxtJpOssShowcase>
    <section v-if="organizations && !entryId" id="organizations">
    <NuxtJpOssShowcase v-if="organizations && !entryId" :feed="organizations" :locale="site.locale.value" :now="now" :kind-label="ja ? '組織の紹介サイト・公開候補' : 'Organization site candidates'">
      <template #heading><h2>{{ ja ? '各組織の提供価値を知る' : 'Explore the organizations' }}</h2></template>
    </NuxtJpOssShowcase>
    </section>
  </article>
</template>
<style scoped>
.oss-page { --showcase-accent: #17634b; --showcase-background: #edf6f1; --showcase-border: #abcbbb; }
.oss-intro { max-width: 55rem; margin: 0 auto 2rem; padding: 1.5rem; }
h1 { font-size: clamp(2.4rem, 6vw, 4.5rem); line-height: 1.12; letter-spacing: -.035em; }
label { display: block; margin-top: 2rem; } input { display: block; width: 100%; padding: .9rem; margin-top: .5rem; border: 1px solid #7a9b8a; border-radius: .45rem; font: inherit; box-sizing: border-box; }
a { color: #17634b; } a:focus-visible, input:focus-visible { outline: 3px solid #d48b22; outline-offset: 3px; }
</style>
