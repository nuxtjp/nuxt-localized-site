import type { SupportedLocale } from '../../contracts/types.js'

export type UnknownRecord = Record<string, unknown>

export function record(value: unknown, path: string, issues: string[]): UnknownRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    issues.push(`${path} must be an object`)
    return {}
  }
  return value as UnknownRecord
}

export function onlyKeys(
  value: UnknownRecord,
  allowed: readonly string[],
  path: string,
  issues: string[]
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) issues.push(`${path}.${key} is not allowed`)
  }
}

export function text(
  value: unknown,
  path: string,
  issues: string[],
  maximum = 4000
): string {
  if (typeof value !== 'string' || value.trim() === '') {
    issues.push(`${path} must be a non-empty string`)
    return ''
  }
  if (value.length > maximum) issues.push(`${path} exceeds ${maximum} characters`)
  return value
}

export function identifier(value: unknown, path: string, issues: string[]): string {
  const result = text(value, path, issues, 80)
  if (result && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) {
    issues.push(`${path} must be a kebab-case identifier`)
  }
  return result
}

export function locale(value: unknown, path: string, issues: string[]): SupportedLocale {
  if (value !== 'ja' && value !== 'en') {
    issues.push(`${path} must be ja or en`)
    return 'ja'
  }
  return value
}

export function textList(value: unknown, path: string, issues: string[]): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(`${path} must be a non-empty array`)
    return []
  }
  return value.map((entry, index) => text(entry, `${path}[${index}]`, issues))
}

export function exactBoolean(
  value: unknown,
  expected: boolean,
  path: string,
  issues: string[]
): boolean {
  if (value !== expected) issues.push(`${path} must be ${String(expected)}`)
  return expected
}
