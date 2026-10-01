<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { MaintenanceMessage } from '../../core/maintenance'
import { maintenanceForService } from '../../core/maintenance'
import { useLocalizedSite } from '../composables/useLocalizedSite'

const site = useLocalizedSite()
const notice = ref<MaintenanceMessage | null>(null)

onMounted(async () => {
  try {
    const response = await fetch('/maintenance.json', {
      credentials: 'same-origin',
      signal: AbortSignal.timeout(2000)
    })
    if (!response.ok) throw new Error('Maintenance state is unavailable')
    const source = await response.text()
    if (source.length > 65_536) throw new Error('Maintenance state is too large')
    const document: unknown = JSON.parse(source)
    notice.value = maintenanceForService(document, site.config.serviceId)
  } catch {
    notice.value = null
  }
})
</script>

<template>
  <aside v-if="notice" class="nls-maintenance" role="status">
    <strong>{{ site.locale.value === 'ja' ? 'メンテナンス中' : 'Maintenance' }}</strong>
    <span>{{ notice[site.locale.value] }}</span>
  </aside>
</template>
