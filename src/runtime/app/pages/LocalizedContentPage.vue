<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import type { DocumentId } from '../../../contracts/types'
import LocalizedDocument from '../components/LocalizedDocument.vue'
import LocalizedLanding from '../components/LocalizedLanding.vue'
import EditorialLanding from '../components/EditorialLanding.vue'
import { useLocalizedSite } from '../composables/useLocalizedSite'

const site = useLocalizedSite()
const editorial = Boolean(useRuntimeConfig().public.nuxtJpPresentation)
const documentId = computed(() => (
  site.pageId.value && site.pageId.value !== 'landing'
    ? site.pageId.value as DocumentId
    : undefined
))
</script>

<template>
    <EditorialLanding v-if="!documentId && editorial" />
    <LocalizedLanding v-else-if="!documentId" />
  <LocalizedDocument v-else :document-id="documentId" />
</template>
