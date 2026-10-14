<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useLocalizedSite } from '../composables/useLocalizedSite'
const site = useLocalizedSite()
const snapshot = useRuntimeConfig().public.nuxtJpOssShowcase
const feed = snapshot ? JSON.parse(snapshot) : null
const ja = computed(() => site.locale.value === 'ja')
const now = Date.now()
const theme = useRuntimeConfig().public.nuxtJpPresentation?.theme
</script>
<template>
  <article class="editorial-landing">
    <div class="editorial-hero">
      <div><p class="editorial-eyebrow">{{ site.content.value.brand }} / OPEN SOURCE</p><h1>{{ site.content.value.tagline }}</h1><p>{{ site.content.value.summary }}</p><NuxtLink class="editorial-link" :to="site.localePath(site.locale.value, '/oss')">{{ ja ? 'プロジェクトを見る' : 'Explore the projects' }} ↗</NuxtLink></div>
      <div class="editorial-diagram" :class="`scene-${theme}`" aria-hidden="true"><div v-if="theme === 'vpremises'" class="environment-stack"><b>CONFIGURATION</b><b>PLAN</b><b>RECEIPT</b></div><div v-else-if="theme === 'nuxtjp'" class="interface-scene"><i></i><strong>Nuxt.</strong><span>UI / LOCAL / INTERACTION</span></div><span v-else>{ }</span><div class="diagram-outline"></div><small>{{ ja ? '構造を表すイラスト' : 'Conceptual illustration' }}</small></div>
    </div>
    <section class="editorial-directions"><article v-for="feature in site.content.value.features" :key="feature.id"><h2>{{ feature.title }}</h2><p>{{ feature.summary }}</p></article></section>
    <section v-if="feed" class="editorial-adoption"><p class="editorial-eyebrow">PUBLIC REGISTRY / DOWNLOADS</p><h2>{{ ja ? '公開パッケージの利用状況。' : 'A view of public package adoption.' }}</h2><NuxtJpDownloadSummary :feed="feed" :locale="site.locale.value" :now="now" /><NuxtLink class="editorial-link" :to="site.localePath(site.locale.value, '/oss')">{{ ja ? '個別のパッケージと詳細へ' : 'Packages and individual observations' }} ↗</NuxtLink></section>
  </article>
</template>
<style scoped>
.editorial-hero{display:grid;grid-template-columns:1.25fr 1fr;align-items:center;gap:65px;padding-block:40px 85px}.editorial-hero h1{max-width:750px}.editorial-hero p:not(.editorial-eyebrow){font-size:15px;max-width:600px;line-height:2}.editorial-diagram{color:var(--editorial-accent);position:relative;aspect-ratio:1;display:grid;place-items:center;background:repeating-linear-gradient(0deg,transparent,transparent 29px,color-mix(in srgb,var(--editorial-accent) 10%,transparent) 30px),repeating-linear-gradient(90deg,transparent,transparent 29px,color-mix(in srgb,var(--editorial-accent) 10%,transparent) 30px)}.editorial-diagram>span{font-family:monospace;font-size:100px;letter-spacing:-.1em}.diagram-outline{position:absolute;width:80%;height:80%;border:1px solid currentColor;transform:rotate(20deg)}.editorial-diagram small{position:absolute;bottom:14px;font-size:9px;letter-spacing:.12em}.environment-stack{width:65%;display:grid;gap:18px;transform:rotate(-10deg);z-index:1}.environment-stack b{font-family:monospace;font-weight:400;background:var(--editorial-paper);border:1px solid currentColor;padding:20px 15px;font-size:12px;text-align:center;box-shadow:10px 10px 0 color-mix(in srgb,var(--editorial-accent) 10%,transparent)}.environment-stack b:nth-child(2){transform:translateX(15px)}.environment-stack b:nth-child(3){transform:translateX(30px)}.interface-scene{width:70%;padding:20px;background:var(--editorial-paper);border:1px solid currentColor;transform:rotate(5deg);z-index:1;box-shadow:12px 12px 0 color-mix(in srgb,var(--editorial-accent) 10%,transparent)}.interface-scene i{display:block;width:100%;height:10px;border-bottom:1px solid currentColor}.interface-scene strong{display:block;font-size:58px;letter-spacing:-.05em;padding-block:25px}.interface-scene>span{font-family:monospace;font-size:10px}.scene-crowsi .diagram-outline{border-radius:50%;transform:none}.editorial-directions{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;padding-block:35px 70px;border-top:1px solid var(--showcase-border)}.editorial-directions h2{font-size:23px}.editorial-directions p{font-size:14px}.editorial-link{display:inline-block;margin-top:25px;border-bottom:1px solid currentColor;padding-block:8px;font-size:13px}.editorial-adoption{padding-block:35px}@media(max-width:640px){.editorial-hero{grid-template-columns:1fr;gap:40px;padding-block:0 60px}.editorial-diagram{max-width:350px;width:100%;margin-inline:auto}.editorial-directions{grid-template-columns:1fr;gap:25px}}
</style>
