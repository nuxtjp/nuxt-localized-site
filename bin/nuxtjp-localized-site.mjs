#!/usr/bin/env node
import { runValidatorCli } from '../validator/content/cli.js'

if (process.argv[2] === 'site') {
  try {
    const { runOrganizationCli } = await import('../organization/cli.mjs')
    process.exitCode = await runOrganizationCli(process.argv.slice(3))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
} else process.exitCode = await runValidatorCli(process.argv.slice(2), {
  out: value => process.stdout.write(`${value}\n`),
  error: value => process.stderr.write(`${value}\n`)
})
