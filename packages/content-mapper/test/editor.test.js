import * as assert from 'node:assert/strict'
import * as childProcess from 'node:child_process'
import * as path from 'node:path'
import * as process from 'node:process'
import * as test from 'node:test'
import * as url from 'node:url'

import { createMessageConnection } from 'vscode-jsonrpc/node.js'

import { compilerFilePath, createProject } from './create-project.js'

test.test('offers input completion and refreshes unsaved template content', { timeout: 15000 }, async (testContext) => {
  const projectDirPath = await createProject(testContext, {
    'greeting.tplx': 'Hello {name}',
    'index.ts': "import { format } from './greeting.tplx'\nformat({ })\n",
  })

  const compilerProcess = childProcess.spawn(
    process.execPath,
    [compilerFilePath, '--lsp', '--stdio'],
    { cwd: projectDirPath, stdio: ['pipe', 'pipe', 'pipe'] },
  )

  let compilerErrors = ''

  compilerProcess.stderr.on('data', (chunk) => { compilerErrors += chunk })

  const messageConnection = createMessageConnection(
    compilerProcess.stdout,
    compilerProcess.stdin,
  )

  testContext.after(() => {
    messageConnection.dispose()
    compilerProcess.kill()
  })

  messageConnection.onRequest('workspace/configuration', (parameters) =>
    parameters.items.map(() => null),
  )

  messageConnection.onRequest('client/registerCapability', () => null)

  messageConnection.listen()

  const projectUri = url.pathToFileURL(projectDirPath).href

  await messageConnection.sendRequest('initialize', {
    processId: process.pid,
    rootUri: projectUri,
    workspaceFolders: [{ uri: projectUri, name: 'tplx-test' }],
    capabilities: {},
    initializationOptions: { runExternalCode: true },
  })

  await messageConnection.sendNotification('initialized', {})

  const importerUri = url.pathToFileURL(path.join(projectDirPath, 'index.ts')).href

  await messageConnection.sendNotification('textDocument/didOpen', {
    textDocument: {
      uri: importerUri,
      languageId: 'typescript',
      version: 1,
      text: "import { format } from './greeting.tplx'\nformat({ })\n",
    },
  })

  const completionParameters = {
    textDocument: { uri: importerUri },
    position: { line: 1, character: 9 },
  }

  const firstCompletion = await messageConnection.sendRequest(
    'textDocument/completion', completionParameters,
  )

  assert.ok(firstCompletion?.items?.some((item) => item.label === 'name'), JSON.stringify({ firstCompletion, compilerErrors }))

  const templateUri = url.pathToFileURL(path.join(projectDirPath, 'greeting.tplx')).href

  await messageConnection.sendNotification('textDocument/didOpen', {
    textDocument: { uri: templateUri, languageId: 'markdown', version: 1, text: 'Hello {name}' },
  })

  await messageConnection.sendNotification('textDocument/didChange', {
    textDocument: { uri: templateUri, version: 2 },
    contentChanges: [{ text: 'Hello {topic}' }],
  })

  const updatedCompletion = await messageConnection.sendRequest(
    'textDocument/completion', completionParameters,
  )

  assert.ok(updatedCompletion?.items?.some((item) => item.label === 'topic'), JSON.stringify({ updatedCompletion, compilerErrors }))
  assert.ok(!updatedCompletion.items.some((item) => item.label === 'name'))

  await messageConnection.sendRequest('shutdown')
  await messageConnection.sendNotification('exit')
})
