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
export function format(tpl, values, options) {
  const strict = options?.strict ?? true

  const delimiters = {
    open: options?.delimiters?.open ?? defaultDelimiters.open,
    close: options?.delimiters?.close ?? defaultDelimiters.close,
  }

  const missingInputValues = []

  const inputsRegExp = getInputsRegExp(delimiters)

  const formatted = tpl.replace(inputsRegExp, (_match, input) => {
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
export function getInputs(tpl, delimiters) {
  const inputsRegExp = getInputsRegExp({
    open: delimiters?.open ?? defaultDelimiters.open,
    close: delimiters?.close ?? defaultDelimiters.close,
  })

  const inputs = []

  let match

  while ((match = inputsRegExp.exec(tpl))) {
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
 * @type {import('./index.d.ts').read}
 */
export async function read(templateFileName, options) {
  const templateFileContent = await fs.promises.readFile(
    templateFileName,
    'utf8',
  )

  const { content, data } = matter(templateFileContent)

  const templateFileOptions = data.tplx || {}

  const mergedOptions = {
    ...templateFileOptions,
    ...options,
  }

  if (templateFileOptions.delimiters || options?.delimiters) {
    mergedOptions.delimiters = {
      ...templateFileOptions.delimiters,
      ...options?.delimiters,
    }
  }

  const inputs = getInputs(content, mergedOptions.delimiters)

  return {
    content,
    inputs,
    options: mergedOptions,
  }
}

/**
 * @type {import('./index.d.ts').readSync}
 */
export function readSync(templateFileName, options) {
  const templateFileContent = fs.readFileSync(templateFileName, 'utf8')

  const { content, data } = matter(templateFileContent)

  const templateFileOptions = data.tplx || {}

  const mergedOptions = {
    ...templateFileOptions,
    ...options,
  }

  if (templateFileOptions.delimiters || options?.delimiters) {
    mergedOptions.delimiters = {
      ...templateFileOptions.delimiters,
      ...options?.delimiters,
    }
  }

  const inputs = getInputs(content, mergedOptions.delimiters)

  return {
    content,
    inputs,
    options: mergedOptions,
  }
}
