import * as process from 'node:process'

import { createMessageConnection, ResponseError } from 'vscode-jsonrpc/node.js'

import { buildTemplateDeclaration } from './build-template-declaration.js'

const openProjects = new Set()

const messageConnection = createMessageConnection(process.stdin, process.stdout)

function main() {
  messageConnection.onRequest('initialize', initializeMapper)

  messageConnection.onRequest('openProject', (parameters) => {
    openProjects.add(parameters.projectHandle)

    return {}
  })

  messageConnection.onRequest('transform', transformTemplate)

  messageConnection.onRequest('closeProject', (parameters) => {
    openProjects.delete(parameters.projectHandle)

    return null
  })

  messageConnection.onClose(() => openProjects.clear())

  messageConnection.listen()
}

function initializeMapper(parameters) {
  if (!parameters.positionEncodings?.includes('utf-16')) {
    throw new ResponseError(-32602, 'TPLX requires UTF-16 position support')
  }

  return { positionEncoding: 'utf-16', diagnosticSource: 'tplx' }
}

function transformTemplate(parameters) {
  if (!openProjects.has(parameters.projectHandle)) {
    throw new ResponseError(-32602, 'The TPLX project has not been opened')
  }

  try {
    return buildTemplateDeclaration(parameters.content)
  } catch (error) {
    return {
      text: 'export {}\n',
      extension: '.ts',
      mappings: [],
      diagnostics: [{
        messageText: error instanceof Error ? error.message : String(error),
        start: 0,
        length: Math.min(parameters.content.length, 3),
        code: 1,
      }],
    }
  }
}

main()
