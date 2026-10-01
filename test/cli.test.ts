import { describe, expect, it } from 'vitest'
import { runValidatorCli } from '../src/content/cli'
import { contentRoot } from './fixture'

function capture() {
  const out: string[] = []
  const errors: string[] = []
  return {
    out,
    errors,
    output: {
      out: (value: string) => out.push(value),
      error: (value: string) => errors.push(value)
    }
  }
}

describe('public validator CLI', () => {
  it('validates only an explicitly supplied content root', async () => {
    const result = capture()
    expect(await runValidatorCli(
      ['validate', '--content-root', contentRoot],
      result.output
    )).toBe(0)
    expect(JSON.parse(result.out[0] ?? '{}')).toMatchObject({
      valid: true,
      siteId: 'sample-service-site',
      externalActions: false
    })
    expect(result.errors).toEqual([])
  })

  it('does not infer a content root', async () => {
    const result = capture()
    expect(await runValidatorCli(['validate'], result.output)).toBe(1)
    expect(result.errors[0]).toMatch(/--content-root/)
  })
})
