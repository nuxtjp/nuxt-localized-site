<script setup lang="ts">
import fixture from '../../data/showcase.json'
const route = useRoute()
const locale = computed(() => route.query.lang === 'en' ? 'en' : 'ja')
const entryId = computed(() => String(route.params.id))
</script>
<template>
  <main>
    <NuxtLink to="/oss">Catalog / 一覧</NuxtLink>
    <NuxtJpOssShowcase :feed="fixture" :locale="locale" :now="Date.parse(fixture.observedAt)" :entry-id="entryId" />
  </main>
</template>
