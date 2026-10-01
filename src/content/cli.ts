import { resolve } from 'node:path'
import { loadSiteConfig } from './load.js'

export interface CliOutput {
  out(value: string): void
  error(value: string): void
}

function contentRoot(args: string[]): string {
  if (args[0] !== 'validate') throw new Error('expected the validate command')
  const flagIndex = args.indexOf('--content-root')
  const value = flagIndex >= 0 ? args[flagIndex + 1] : undefined
  if (!value || args.length !== 3) {
    throw new Error('usage: nuxtjp-localized-site validate --content-root <path>')
  }
  return resolve(value)
}

export async function runValidatorCli(args: string[], output: CliOutput): Promise<number> {
  try {
    const config = loadSiteConfig(contentRoot(args))
    output.out(JSON.stringify({
      schema: 'nuxtjp://localized-site/validation-result/v1',
      valid: true,
      siteId: config.siteId,
      serviceId: config.serviceId,
      locales: config.locales,
      routes: ['/', '/docs', '/docs/getting-started', '/docs/security'],
      externalActions: config.externalActions
    }, null, 2))
    return 0
  } catch (error) {
    output.error(error instanceof Error ? error.message : 'site validation failed')
    return 1
  }
}
