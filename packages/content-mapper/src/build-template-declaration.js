import { parseTemplate } from '@tplx/core'

export function buildTemplateDeclaration(templateFileContent) {
  const template = parseTemplate(templateFileContent)

  const inputs = [...new Set(template.inputs)]

  const inputOptionality = template.options.strict === false ? '?' : ''

  const inputProperties = inputs.map(
    (input) => `  ${JSON.stringify(input)}${inputOptionality}: unknown`,
  )

  const valuesType = inputs.length
    ? `{
${inputProperties.join('\n')}
}`
    : 'Record<string, unknown>'

  return {
    text: `export declare function format(values: ${valuesType}): string\n`,
    extension: '.ts',
    mappings: [],
  }
}
