import { describe, expect, it } from 'vitest'
import {
  MAINTENANCE_SCHEMA,
  maintenanceForService,
  parseMaintenanceDocument
} from '../src/runtime/core/maintenance'

function document() {
  return {
    schema: MAINTENANCE_SCHEMA,
    generatedAt: '2026-07-28T00:00:00.000Z',
    expiresAt: '2026-07-29T00:00:00.000Z',
    global: {
      state: 'operational' as const,
      message: { ja: '通常稼働中です。', en: 'Service is operational.' },
      expiresAt: '2026-07-28T00:05:00.000Z'
    },
    services: [{
      serviceId: 'nerp-console',
      state: 'maintenance' as const,
      message: { ja: '確認作業中です。', en: 'Maintenance is in progress.' },
      expiresAt: '2026-07-28T01:00:00.000Z'
    }]
  }
}

describe('public maintenance projection', () => {
  it('selects service maintenance and lets global maintenance override it', () => {
    const value = document()
    expect(maintenanceForService(value, 'nerp-console', Date.parse(value.generatedAt)))
      .toEqual(value.services[0]?.message)
    const global = {
      ...value,
      global: {
        ...value.global,
        state: 'maintenance' as const,
        expiresAt: value.expiresAt
      }
    }
    expect(maintenanceForService(global, 'another-service', Date.parse(value.generatedAt)))
      .toEqual(value.global.message)
  })

  it('ignores stale, duplicated, or open documents', () => {
    const value = document()
    expect(maintenanceForService(value, 'nerp-console', Date.parse(value.expiresAt))).toBeNull()
    value.services.push({ ...value.services[0]! })
    expect(parseMaintenanceDocument(value)).toBeNull()
    expect(parseMaintenanceDocument({ ...document(), credential: 'prohibited' })).toBeNull()
  })
})
