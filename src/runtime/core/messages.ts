import type {
  ResolvedSiteConfig,
  SupportedLocale
} from '../../contracts/types'

export type MessageDictionary = Record<string, string>
export type LocalizedMessages<Key extends string> = {
  readonly ja: Readonly<Record<Key, string>>
  readonly en: Readonly<Record<Key, string>>
}

type NoExtraKeys<Expected, Actual> = Actual & Record<
  Exclude<keyof Actual, keyof Expected>,
  never
>

export function defineLocalizedMessages<
  const Ja extends MessageDictionary,
  const En extends Record<keyof Ja, string>
>(messages: {
  ja: Ja
  en: NoExtraKeys<Ja, En>
}): LocalizedMessages<Extract<keyof Ja, string>> {
  return messages
}

export function translatedMessage<Key extends string>(
  messages: LocalizedMessages<Key>,
  key: Key,
  locale: SupportedLocale,
  config: Pick<ResolvedSiteConfig, 'defaultLocale' | 'fallbackLocale'>
): string {
  const order = [locale, config.fallbackLocale, config.defaultLocale]
    .filter((entry, index, values) => values.indexOf(entry) === index)
  for (const candidate of order) {
    const value = messages[candidate][key]
    if (typeof value === 'string' && value.trim() !== '') return value
  }
  throw new Error(`localized message is empty in every fallback locale: ${key}`)
}
