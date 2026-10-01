import type { LocalizedMessages } from '../../core/messages'
import { translatedMessage } from '../../core/messages'
import { useLocalizedSite } from './useLocalizedSite'

export function useLocalizedMessages<Key extends string>(
  messages: LocalizedMessages<Key>
) {
  const site = useLocalizedSite()

  function t(key: Key): string {
    return translatedMessage(
      messages,
      key,
      site.locale.value,
      site.config
    )
  }

  return { ...site, t }
}
