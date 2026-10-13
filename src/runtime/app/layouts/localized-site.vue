<script setup lang="ts">
import { useLocalizedSite, useRuntimeConfig } from '#imports'
const hasShowcase = Boolean(useRuntimeConfig().public.nuxtJpOssShowcase)

const site = useLocalizedSite()
</script>

<template>
  <div class="nls-shell">
    <header class="nls-header">
      <NuxtLink :to="site.localePath(site.locale.value, '/')">
        {{ site.content.value.brand }}
      </NuxtLink>
      <nav :aria-label="site.locale.value === 'ja' ? '主要' : 'Primary'">
        <NuxtLink :to="site.localePath(site.locale.value, '/')">
          {{ site.locale.value === 'ja' ? 'ホーム' : 'Home' }}
        </NuxtLink>
        <NuxtLink :to="site.localePath(site.locale.value, '/docs')">
          {{ site.content.value.docs.overview.title }}
        </NuxtLink>
        <NuxtLink v-if="hasShowcase" :to="site.localePath(site.locale.value, '/oss')">
          {{ site.locale.value === 'ja' ? 'OSS・モジュール' : 'OSS & modules' }}
        </NuxtLink>
      </nav>
      <NuxtJpLocalizedLanguageSwitcher />
    </header>
    <NuxtJpPublicMaintenanceNotice />
    <main id="main-content" class="nls-main">
      <slot />
    </main>
    <footer class="nls-footer">
      <section>
        <strong>{{ site.content.value.privacy.label }}</strong>
        <p>{{ site.content.value.privacy.summary }}</p>
      </section>
      <section>
        <strong>{{ site.content.value.contact.label }}</strong>
        <p>{{ site.content.value.contact.summary }}</p>
      </section>
    </footer>
  </div>
</template>
