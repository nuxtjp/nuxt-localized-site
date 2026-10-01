<script setup lang="ts">
import { useLocalizedSite } from '../composables/useLocalizedSite'

const site = useLocalizedSite()
</script>

<template>
  <article class="nls-landing">
    <p class="nls-eyebrow">{{ site.config.serviceId }}</p>
    <h1>{{ site.content.value.brand }}</h1>
    <p class="nls-tagline">{{ site.content.value.tagline }}</p>
    <p>{{ site.content.value.summary }}</p>
    <section class="nls-features" :aria-label="site.content.value.tagline">
      <article v-for="feature in site.content.value.features" :key="feature.id">
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.summary }}</p>
      </article>
    </section>
    <NuxtLink
      class="nls-primary-link"
      :to="site.localePath(site.locale.value, '/docs')"
    >
      {{ site.content.value.docs.overview.title }}
    </NuxtLink>
  </article>
</template>
