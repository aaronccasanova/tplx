#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as util from 'node:util'
import { render, getInputs } from '../src/index.js'

const { command, templateFileName, primaryArgs, secondaryArgs } = getArgs()

if (command === 'inspect') {
  const options = getOptions(primaryArgs)

  const tpl = await getTpl(templateFileName)

  const inputs = getInputs(tpl, options.delimiters)

  if (!inputs.length) {
    console.log('No inputs required for this template.')
    process.exit(0)
  }

  const templateFileNameFromCWD = path.relative(
    process.cwd(),
    path.resolve(templateFileName),
  )

  const output = `
Options:

  --strict            Error on missing input values (default: true)
  --open-delimiter    Customize open delimiter (default: '{')
  --close-delimiter   Customize close delimiter (default: '}')

Inputs:

${inputs.map((input) => `  --${input} <${input}>`).join('\n')}

Example:

npx tplx format ${templateFileNameFromCWD} [options...] -- \\
${inputs
  .map(
    (input, i) =>
      `  --${input} <${input}>${i === inputs.length - 1 ? '' : ' \\'}`,
  )
  .join('\n')}
  `.trim()

  console.log(output)
  process.exit(0)
}

if (command === 'format') {
  const options = getOptions(primaryArgs)

  const tpl = await getTpl(templateFileName)

  const inputs = getInputs(tpl, options.delimiters)

  if (!inputs.length) {
    console.log(tpl)
    process.exit(0)
  }

  const values = getValues(secondaryArgs, inputs)

  try {
    console.log(render(tpl, values, options))

    process.exit(0)
  } catch (error) {
    console.error(`Error: ${error.message}, received values:`)
    console.error(JSON.stringify(values, null, 2))

    process.exit(1)
  }
}

throw new Error(`Unknown command: ${command}`)

// --- Utilities ---

function getArgs() {
  const [_, __, command, templateFileName, ...restArgs] = process.argv

  const primaryArgs = []
  const secondaryArgs = []

  let hasOptionTerminator = false

  for (const arg of restArgs) {
    if (hasOptionTerminator) {
      secondaryArgs.push(arg)
    } else if (arg === '--') {
      hasOptionTerminator = true
    } else {
      primaryArgs.push(arg)
    }
  }

  return {
    command,
    templateFileName,
    hasOptionTerminator,
    primaryArgs,
    secondaryArgs,
  }
}

function getOptions(args) {
  const optionArgs = util.parseArgs({
    args,
    options: {
      strict: { type: 'boolean', short: 's' },
      'open-delimiter': { type: 'string' },
      'close-delimiter': { type: 'string' },
    },
  })

  return {
    strict: optionArgs.values.strict ?? false,
    delimiters: {
      open: optionArgs.values['open-delimiter'] ?? '{',
      close: optionArgs.values['close-delimiter'] ?? '}',
    },
  }
}

function getTpl(templateFileName) {
  return fs.promises
    .readFile(path.resolve(templateFileName), 'utf8')
    .catch((error) => {
      console.error('Error reading template file:')
      console.error(error.message)

      process.exit(1)
    })
}

function getValues(args, inputs) {
  return util.parseArgs({
    args,
    options: Object.fromEntries(
      inputs.map((input) => [input, { type: 'string' }]),
    ),
  }).values
}
