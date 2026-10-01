export const MAINTENANCE_SCHEMA = 'nuxtjp://public/maintenance-state/v1'

export type MaintenanceState = 'operational' | 'maintenance'

export interface MaintenanceMessage {
  ja: string
  en: string
}

export interface MaintenanceTarget {
  serviceId: string
  state: MaintenanceState
  message: MaintenanceMessage
  expiresAt: string
}

export interface PublicMaintenanceDocument {
  schema: typeof MAINTENANCE_SCHEMA
  generatedAt: string
  expiresAt: string
  global: {
    state: MaintenanceState
    message: MaintenanceMessage
    expiresAt: string
  }
  services: MaintenanceTarget[]
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function message(value: unknown): value is MaintenanceMessage {
  if (!record(value) || Object.keys(value).sort().join(',') !== 'en,ja') return false
  return ['ja', 'en'].every((key) => {
    const text = value[key]
    return typeof text === 'string'
      && text.trim().length > 0
      && text.length <= 240
      && !/[\u0000-\u001f\u007f]/u.test(text)
  })
}

function state(value: unknown): value is MaintenanceState {
  return value === 'operational' || value === 'maintenance'
}

function target(value: unknown): value is MaintenanceTarget {
  if (!record(value)) return false
  if (Object.keys(value).sort().join(',') !== 'expiresAt,message,serviceId,state') return false
  return typeof value.serviceId === 'string'
    && /^[a-z][a-z0-9-]{0,63}$/u.test(value.serviceId)
    && state(value.state)
    && message(value.message)
    && validTimestamp(value.expiresAt)
}

export function parseMaintenanceDocument(value: unknown): PublicMaintenanceDocument | null {
  if (!record(value)) return null
  const keys = Object.keys(value).sort().join(',')
  if (keys !== 'expiresAt,generatedAt,global,schema,services') return null
  if (value.schema !== MAINTENANCE_SCHEMA || !record(value.global)) return null
  const globalKeys = Object.keys(value.global).sort().join(',')
  if (globalKeys !== 'expiresAt,message,state') return null
  if (!state(value.global.state) || !message(value.global.message)
    || !validTimestamp(value.global.expiresAt)) return null
  if (!Array.isArray(value.services) || value.services.length > 128) return null
  if (!value.services.every(target)) return null
  const ids = new Set(value.services.map(item => item.serviceId))
  if (ids.size !== value.services.length) return null
  if (!validTimestamp(value.generatedAt) || !validTimestamp(value.expiresAt)) return null
  const generated = Date.parse(value.generatedAt)
  const expires = Date.parse(value.expiresAt)
  const targetExpiries = [
    Date.parse(value.global.expiresAt),
    ...value.services.map(item => Date.parse(item.expiresAt))
  ]
  if (generated >= expires
    || targetExpiries.some(time => time < generated || time > expires)) return null
  return value as unknown as PublicMaintenanceDocument
}

export function maintenanceForService(
  value: unknown,
  serviceId: string,
  now = Date.now()
): MaintenanceMessage | null {
  const document = parseMaintenanceDocument(value)
  if (!document || Date.parse(document.expiresAt) <= now) return null
  if (document.global.state === 'maintenance'
    && Date.parse(document.global.expiresAt) > now) return document.global.message
  const service = document.services.find(item => item.serviceId === serviceId)
  return service?.state === 'maintenance' && Date.parse(service.expiresAt) > now
    ? service.message
    : null
}

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value)
    && Number.isFinite(Date.parse(value))
}
