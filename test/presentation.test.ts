import { describe, expect, it } from 'vitest'
import { validatePresentation } from '../src/runtime/core/presentation'
describe('explicit site presentation boundary', () => {
  it('uses no theme unless requested and accepts scoped presets', () => {
    expect(validatePresentation(undefined)).toBeNull()
    expect(validatePresentation({ theme: 'coela', scope: 'portfolio' })).toEqual({ theme: 'coela', scope: 'portfolio' })
    expect(validatePresentation({ theme: 'nuxtjp', scope: 'organization' })).toEqual({ theme: 'nuxtjp', scope: 'organization' })
    expect(validatePresentation({ theme: 'nerp', scope: 'product' })).toEqual({ theme: 'nerp', scope: 'product' })
  })
  it('rejects arbitrary CSS, unknown scope and accidental secret options', () => {
    for (const value of [{ theme: 'url(secret)', scope: 'organization' }, { theme: 'coela', scope: 'private' }, { theme: 'coela', scope: 'portfolio', token: 'synthetic' }]) {
      expect(() => validatePresentation(value as never)).toThrow('Invalid presentation options')
    }
  })
})
