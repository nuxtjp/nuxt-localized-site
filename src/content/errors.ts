export class SiteContractError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`site contract is invalid:\n- ${issues.join('\n- ')}`)
    this.name = 'SiteContractError'
    this.issues = issues
  }
}
