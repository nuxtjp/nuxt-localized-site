<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentId } from '../../../contracts/types'
import { useLocalizedSite } from '../composables/useLocalizedSite'

const props = defineProps<{ documentId: DocumentId }>()
const site = useLocalizedSite()
const document = computed(() => site.content.value.docs[props.documentId])
</script>

<template>
  <article class="nls-document">
    <p class="nls-eyebrow">{{ site.content.value.brand }}</p>
    <h1>{{ document.title }}</h1>
    <p class="nls-tagline">{{ document.summary }}</p>
    <section v-for="section in document.sections" :key="section.id">
      <h2>{{ section.title }}</h2>
      <p v-for="paragraph in section.body" :key="paragraph">
        {{ paragraph }}
      </p>
    </section>
  </article>
</template>
