<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useLocalizedSite } from '../composables/useLocalizedSite'
const site = useLocalizedSite()
const ja = computed(() => site.locale.value === 'ja')
const theme = useRuntimeConfig().public.nuxtJpPresentation?.theme
const introduction = computed(() => site.content.value.docs.gettingStarted)
</script>
<template>
  <article class="editorial-landing product-landing">
    <div class="editorial-hero">
      <div>
        <p class="editorial-eyebrow">{{ site.content.value.brand }} / PRODUCT</p>
        <h1>{{ site.content.value.tagline }}</h1><p>{{ site.content.value.summary }}</p>
        <NuxtLink class="editorial-link" :to="site.localePath(site.locale.value, '/docs')">{{ ja ? '機能・使い方を知る' : 'Explore features & usage' }} ↗</NuxtLink>
      </div>
      <div class="editorial-diagram" :class="`scene-${theme}`" aria-hidden="true"><div class="diagram-outline"></div></div>
    </div>
    <section class="editorial-directions" :aria-label="ja ? '製品の特徴' : 'Product features'">
      <article v-for="feature in site.content.value.features" :key="feature.id"><h2>{{ feature.title }}</h2><p>{{ feature.summary }}</p></article>
    </section>
    <section class="product-introduction">
      <p class="editorial-eyebrow">GET STARTED</p><h2>{{ introduction.title }}</h2><p>{{ introduction.summary }}</p>
      <NuxtLink class="editorial-link" :to="site.localePath(site.locale.value, '/docs/getting-started')">{{ ja ? '提供状況と導入手順' : 'Availability & installation' }} ↗</NuxtLink>
    </section>
  </article>
</template>
<style scoped>
.editorial-hero{display:grid;grid-template-columns:1.25fr 1fr;align-items:center;gap:65px;padding-block:40px 85px}
.editorial-hero p:not(.editorial-eyebrow){font-size:15px;max-width:600px;line-height:2}
.editorial-diagram{color:var(--editorial-accent);position:relative;aspect-ratio:1;min-width:0;display:grid;place-items:center;background:color-mix(in srgb,var(--editorial-accent) 6%,transparent)}
.diagram-outline{width:80%;height:80%;border:1px solid currentColor;transform:rotate(20deg)}
.editorial-directions{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;padding-block:35px 70px;border-top:1px solid var(--showcase-border)}
.editorial-directions h2{font-size:23px}.editorial-directions p,.product-introduction p{font-size:14px}
.editorial-link{display:inline-block;margin-top:25px;border-bottom:1px solid currentColor;padding-block:8px;font-size:13px}
.product-introduction{padding-block:35px 70px}@media(max-width:640px){.editorial-hero,.editorial-directions{grid-template-columns:minmax(0,1fr);gap:25px}.editorial-hero{padding-block:20px 45px}}
</style>
