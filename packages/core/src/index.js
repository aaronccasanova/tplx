import * as fs from 'node:fs'

import matter from 'gray-matter'

/**
 * @typedef {import('./index.d.ts').Delimiters} Delimiters
 */
const defaultDelimiters = {
  open: '{',
  close: '}',
}

/**
 * @type {import('./index.d.ts').format}
 */
export function format(templateContent, values, options) {
  const strict = options?.strict ?? true

  const delimiters = {
    open: options?.delimiters?.open ?? defaultDelimiters.open,
    close: options?.delimiters?.close ?? defaultDelimiters.close,
  }

  /**
   * @type {string[]}
   */
  const missingInputValues = []

  const inputsRegExp = getInputsRegExp(delimiters)

  const formatted = templateContent.replace(inputsRegExp, (_match, input) => {
    if (Object.prototype.hasOwnProperty.call(values, input) && values[input]) {
      return values[input]
    }

    if (strict) missingInputValues.push(input)

    return ''
  })

  if (missingInputValues.length) {
    throw new Error(
      `Missing input values for: '${missingInputValues.join("', '")}'`,
    )
  }

  return formatted
}

/**
 * @type {import('./index.d.ts').getInputs}
 */
export function getInputs(templateContent, delimiters) {
  const inputsRegExp = getInputsRegExp({
    open: delimiters?.open ?? defaultDelimiters.open,
    close: delimiters?.close ?? defaultDelimiters.close,
  })

  const inputs = []

  let match

  while ((match = inputsRegExp.exec(templateContent))) {
    inputs.push(match[1].trim())
  }

  return inputs
}

/**
 * @param {Delimiters} delimiters
 * @returns {RegExp}
 */
function getInputsRegExp(delimiters) {
  return new RegExp(
    escapeDelimiter(delimiters?.open ?? defaultDelimiters.open) +
      String.raw`\s*([^\s]+?)\s*` +
      escapeDelimiter(delimiters?.close ?? defaultDelimiters.close),
    'g',
  )
}

/**
 * @param {string} delimiter
 * @returns {string}
 */
function escapeDelimiter(delimiter) {
  return delimiter.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * Merges template options from front matter and provided options (programmatic options take precedence).
 * Properties are set in order for readability and only when defined to reduce memory in bulk read scenarios.
 * @param {{[key: string]: any}} templateData - Front matter data
 * @param {import('./index.d.ts').Options} [options]
 * @returns {import('./index.d.ts').Options}
 */
function getTemplateOptions(templateData, options = {}) {
  templateData.tplx ??= {}

  const templateOptions = {}

  const title = options.title ?? templateData.tplx.title ?? templateData.title

  if (title) templateOptions.title = title

  const description =
    options.description ??
    templateData.tplx.description ??
    templateData.description

  if (description) templateOptions.description = description

  const strict = options.strict ?? templateData.tplx.strict

  if (typeof strict === 'boolean') templateOptions.strict = strict

  const openDelimiter =
    options.delimiters?.open ?? templateData.tplx.delimiters?.open

  const closeDelimiter =
    options.delimiters?.close ?? templateData.tplx.delimiters?.close

  if (openDelimiter || closeDelimiter) {
    templateOptions.delimiters = {
      open: openDelimiter ?? defaultDelimiters.open,
      close: closeDelimiter ?? defaultDelimiters.close,
    }
  }

  return templateOptions
}

/**
 * @type {import('./index.d.ts').parseTemplate}
 */
export function parseTemplate(templateFileContent, options) {
  const { content: templateContent, data: templateData } =
    matter(templateFileContent)

  const templateOptions = getTemplateOptions(templateData, options)

  const inputs = getInputs(templateContent, templateOptions.delimiters)

  return {
    content: templateContent,
    inputs,
    options: templateOptions,
  }
}

/**
 * @type {import('./index.d.ts').read}
 */
export async function read(templateFileName, options) {
  const templateFileContent = await fs.promises.readFile(
    templateFileName,
    'utf8',
  )

  return parseTemplate(templateFileContent, options)
}

/**
 * @type {import('./index.d.ts').readSync}
 */
export function readSync(templateFileName, options) {
  const templateFileContent = fs.readFileSync(templateFileName, 'utf8')

  return parseTemplate(templateFileContent, options)
}
