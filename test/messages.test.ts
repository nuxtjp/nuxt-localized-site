import { describe, expect, it } from 'vitest'
import { loadSiteConfig } from '../src/content/load'
import {
  defineLocalizedMessages,
  translatedMessage
} from '../src/runtime/core/messages'
import { contentRoot } from './fixture'

describe('typed localized messages', () => {
  const config = loadSiteConfig(contentRoot)
  const messages = defineLocalizedMessages({
    ja: { save: '保存', cancel: 'キャンセル' },
    en: { save: 'Save', cancel: '' }
  })

  it('returns the requested locale and falls back deterministically', () => {
    expect(translatedMessage(messages, 'save', 'en', config)).toBe('Save')
    expect(translatedMessage(messages, 'cancel', 'en', config)).toBe('キャンセル')
  })

  it('keeps message keys as a literal union', () => {
    expect(translatedMessage(messages, 'save', 'ja', config)).toBe('保存')
    if (false) {
      // @ts-expect-error unknown message keys must fail type checking
      translatedMessage(messages, 'unknown', 'ja', config)
    }
  })
})

defineLocalizedMessages({
  ja: { save: '保存', cancel: 'キャンセル' },
  // @ts-expect-error every Japanese key is required in English
  en: { save: 'Save' }
})

defineLocalizedMessages({
  ja: { save: '保存' },
  en: {
    save: 'Save',
    // @ts-expect-error locale dictionaries cannot add unrelated keys
    unexpected: 'Unexpected'
  }
})
