import * as fs from 'node:fs'
import * as module from 'node:module'

import { parseTemplate } from '@tplx/core'

const coreModuleUrl = import.meta.resolve('@tplx/core')

module.registerHooks({ load: loadTemplateModule })

function loadTemplateModule(moduleUrl, context, nextLoad) {
  const templateUrl = new URL(moduleUrl)

  if (templateUrl.protocol !== 'file:' || !templateUrl.pathname.endsWith('.tplx')) {
    return nextLoad(moduleUrl, context)
  }

  const templateFileContent = fs.readFileSync(templateUrl, 'utf8')

  const template = parseTemplate(templateFileContent)

  return {
    format: 'module',
    shortCircuit: true,
    source: [
      `import { format as formatTemplate } from ${JSON.stringify(coreModuleUrl)}`,
      `const templateContent = ${JSON.stringify(template.content)}`,
      `const templateOptions = ${JSON.stringify(template.options)}`,
      'export function format(values) {',
      '  return formatTemplate(templateContent, values, templateOptions)',
      '}',
    ].join('\n'),
  }
}
