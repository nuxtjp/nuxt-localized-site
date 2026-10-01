<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentId } from '../../../contracts/types'
import LocalizedDocument from '../components/LocalizedDocument.vue'
import LocalizedLanding from '../components/LocalizedLanding.vue'
import { useLocalizedSite } from '../composables/useLocalizedSite'

const site = useLocalizedSite()
const documentId = computed(() => (
  site.pageId.value && site.pageId.value !== 'landing'
    ? site.pageId.value as DocumentId
    : undefined
))
</script>

<template>
  <LocalizedLanding v-if="!documentId" />
  <LocalizedDocument v-else :document-id="documentId" />
</template>
