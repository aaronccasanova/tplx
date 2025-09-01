/**
 * @typedef {import('./index.d.ts').Delimiters} Delimiters
 */

/**
 * @type {Delimiters}
 */
const defaultDelimiters = {
  open: '{',
  close: '}',
}

/**
 * @type {import('./index.d.ts').render}
 */
export function render(tpl, values, options) {
  const strict = options?.strict ?? true
  const delimiters = options?.delimiters ?? defaultDelimiters

  const missingInputValues = []

  const inputsRegExp = getInputsRegExp(delimiters)

  const rendered = tpl.replace(inputsRegExp, (_match, input) => {
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

  return rendered
}

/**
 * @type {import('./index.d.ts').getInputs}
 */
export function getInputs(tpl, delimiters = defaultDelimiters) {
  const inputsRegExp = getInputsRegExp(delimiters)

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
    escapeDelimiter(delimiters.open) +
      String.raw`\s*([^\s]+?)\s*` +
      escapeDelimiter(delimiters.close),
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
