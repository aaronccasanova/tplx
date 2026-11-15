import * as assert from 'node:assert/strict'
import * as childProcess from 'node:child_process'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as process from 'node:process'
import * as test from 'node:test'
import * as url from 'node:url'

import { compilerFilePath, contentMapperDirPath, createProject } from './create-project.js'

const registerFileUrl = url.pathToFileURL(
  path.join(contentMapperDirPath, 'src/register.js'),
).href

test.test('checks required names and misspellings without constraining values', async (testContext) => {
  const projectDirPath = await createProject(testContext, {
    'greeting.tplx': 'Hello, {name}! {count} {name}',
    'index.ts': `
import { format } from './greeting.tplx'
const formatted: string = format({ name: { nested: true }, count: 42 })
`,
  })

  assertCompilerSuccess(projectDirPath)

  await fs.writeFile(
    path.join(projectDirPath, 'index.ts'),
    "import { format } from './greeting.tplx'\nformat({ name: 'Aaron' })\n",
  )

  assertCompilerFailure(projectDirPath, /count.*missing|missing.*count/s)

  await fs.writeFile(
    path.join(projectDirPath, 'index.ts'),
    "import { format } from './greeting.tplx'\nformat({ nmae: 'Aaron', count: 1 })\n",
  )

  assertCompilerFailure(projectDirPath, /nmae/)
})

test.test('reuses frontmatter delimiters, flat keys, and explicit non-strict behavior', async (testContext) => {
  const projectDirPath = await createProject(testContext, {
    'greeting.tplx': `---
tplx:
  delimiters: { open: '<<', close: '>>' }
  strict: false
---
<<user.name>> {ignored} <<user.name>>`,
    'index.ts': `
import { format } from './greeting.tplx'
format({})
format({ 'user.name': false })
`,
  })

  assertCompilerSuccess(projectDirPath)

  await fs.writeFile(
    path.join(projectDirPath, 'index.ts'),
    "import { format } from './greeting.tplx'\nformat({ ignored: 'not an input' })\n",
  )

  assertCompilerFailure(projectDirPath, /ignored/)
})

test.test('updates the required inputs when the template changes', async (testContext) => {
  const projectDirPath = await createProject(testContext, {
    'greeting.tplx': 'Hello {name}',
    'index.ts': "import { format } from './greeting.tplx'\nformat({ name: 'Aaron' })\n",
  })

  assertCompilerSuccess(projectDirPath)

  await fs.writeFile(path.join(projectDirPath, 'greeting.tplx'), 'Hello {name}, {topic}')

  assertCompilerFailure(projectDirPath, /topic.*missing|missing.*topic/s)
})

test.test('reports malformed frontmatter and requires external-code permission', async (testContext) => {
  const projectDirPath = await createProject(testContext, {
    'greeting.tplx': '---\ntplx: [\n---\nHello {name}',
    'index.ts': "import './greeting.tplx'\n",
  })

  assertCompilerFailure(projectDirPath, /tplx1/)

  const compilerResult = childProcess.spawnSync(
    process.execPath,
    [compilerFilePath, '--project', projectDirPath, '--pretty', 'false'],
    { encoding: 'utf8', timeout: 15000 },
  )

  assert.notEqual(compilerResult.status, 0)
  assert.match(compilerResult.stdout + compilerResult.stderr, /runExternalCode/)
})

test.test('loads templates in Node and preserves existing coercion and falsy values', async (testContext) => {
  const projectDirPath = await createProject(testContext, {
    'strict.tplx': '<<not-used>> Hello {name}! {count}',
    'optional.tplx': `---
tplx:
  delimiters: { open: '<<', close: '>>' }
  strict: false
---
<<name>> <<count>>`,
    'index.ts': `
import * as assert from 'node:assert/strict'
import { format as formatStrict } from './strict.tplx'
import { format as formatOptional } from './optional.tplx'

assert.equal(formatStrict({ name: { toString: () => 'Aaron' }, count: 42 }), '<<not-used>> Hello Aaron! 42')
assert.throws(() => formatStrict({ name: '', count: 42 }), /Missing input values/)
assert.equal(formatOptional({ name: false, count: 0 }), ' ')
assert.equal(formatOptional({}), ' ')
`,
  })

  const runtimeResult = childProcess.spawnSync(
    process.execPath,
    ['--import', registerFileUrl, path.join(projectDirPath, 'index.ts')],
    { encoding: 'utf8', timeout: 15000 },
  )

  assert.equal(runtimeResult.status, 0, runtimeResult.stdout + runtimeResult.stderr)
})

test.test('emits declarations but leaves template assets to the runtime', async (testContext) => {
  const projectDirPath = await createProject(testContext, {
    'greeting.tplx': 'Hello {name}',
    'index.ts': "import { format } from './greeting.tplx'\nexport const greeting = format({ name: 'Aaron' })\n",
  })

  const compilerResult = runCompiler(projectDirPath, [
    '--noEmit', 'false', '--declaration', '--outDir', 'dist',
  ])

  assert.equal(compilerResult.status, 0, compilerResult.stdout + compilerResult.stderr)

  const outputFileNames = await fs.readdir(path.join(projectDirPath, 'dist'))

  assert.ok(outputFileNames.includes('greeting.d.tplx.ts'))
  assert.ok(!outputFileNames.includes('greeting.js'))

  const declarationFileContent = await fs.readFile(
    path.join(projectDirPath, 'dist/greeting.d.tplx.ts'),
    'utf8',
  )

  assert.match(declarationFileContent, /name.*unknown/)
})

function runCompiler(projectDirPath, argumentsExtra = []) {
  return childProcess.spawnSync(
    process.execPath,
    [compilerFilePath, '--project', projectDirPath, '--runExternalCode', '--pretty', 'false', ...argumentsExtra],
    { encoding: 'utf8', timeout: 15000, cwd: projectDirPath },
  )
}

function assertCompilerSuccess(projectDirPath) {
  const compilerResult = runCompiler(projectDirPath)

  assert.equal(compilerResult.status, 0, compilerResult.stdout + compilerResult.stderr)
}

function assertCompilerFailure(projectDirPath, expectedDiagnostic) {
  const compilerResult = runCompiler(projectDirPath)

  assert.notEqual(compilerResult.status, 0)
  assert.match(compilerResult.stdout + compilerResult.stderr, expectedDiagnostic)
}
