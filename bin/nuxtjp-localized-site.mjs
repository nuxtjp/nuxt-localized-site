#!/usr/bin/env node
import { runValidatorCli } from '../validator/content/cli.js'

process.exitCode = await runValidatorCli(process.argv.slice(2), {
  out: value => process.stdout.write(`${value}\n`),
  error: value => process.stderr.write(`${value}\n`)
})
