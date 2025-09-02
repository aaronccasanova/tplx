#!/usr/bin/env node
import * as path from 'node:path'
import * as util from 'node:util'
import * as tplx from '../src/index.js'

const { command, templateFileName, primaryArgs, secondaryArgs } = getArgs()

if (command === 'inspect') {
  const template = await tplx.read(templateFileName)

  const cliOptions = getOptions(primaryArgs)

  const options = { ...template.options, ...cliOptions }

  if (!template.inputs.length) {
    console.log('No inputs required for this template.')
    process.exit(0)
  }

  const templateFileNameFromCWD = path.relative(
    process.cwd(),
    path.resolve(templateFileName),
  )

  const output = `
Options:

  --strict            Error on missing input values (default: ${
    options.strict ?? true
  })
  --open-delimiter    Customize open delimiter (default: '${
    options.delimiters?.open ?? '{'
  }')
  --close-delimiter   Customize close delimiter (default: '${
    options.delimiters?.close ?? '}'
  }')

Inputs:

${template.inputs.map((input) => `  --${input} <${input}>`).join('\n')}

Example:

npx tplx format ${templateFileNameFromCWD} [options...] -- \\
${template.inputs
  .map(
    (input, i) =>
      `  --${input} <${input}>${i === template.inputs.length - 1 ? '' : ' \\'}`,
  )
  .join('\n')}
  `.trim()

  console.log(output)
  process.exit(0)
}

if (command === 'format') {
  const cliOptions = getOptions(primaryArgs)

  const template = await tplx.read(templateFileName, cliOptions)

  const options = { ...template.options, ...cliOptions }

  if (!template.inputs.length) {
    console.log(template.content)
    process.exit(0)
  }

  const values = getValues(secondaryArgs, template.inputs)

  try {
    console.log(tplx.format(template.content, values, options))

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

  const options = {}

  if (typeof optionArgs.values.strict === 'boolean') {
    options.strict = optionArgs.values.strict
  }

  const delimiters = {}

  if (optionArgs.values['open-delimiter']) {
    delimiters.open = optionArgs.values['open-delimiter']
  }

  if (optionArgs.values['close-delimiter']) {
    delimiters.close = optionArgs.values['close-delimiter']
  }

  if (Object.keys(delimiters).length) {
    options.delimiters = delimiters
  }

  return options
}

function getValues(args, inputs) {
  return util.parseArgs({
    args,
    options: Object.fromEntries(
      inputs.map((input) => [input, { type: 'string' }]),
    ),
  }).values
}
