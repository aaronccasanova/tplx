import * as path from 'node:path'
import { describe, it } from 'node:test'
import assert, { strict } from 'node:assert'

import { getInputs, format, read, readSync } from '../src/index.js'

const templatesDirPath = path.join(import.meta.dirname, './templates')

describe('format', () => {
  it('should replace a single input', () => {
    const templateContent = 'Hello, {name}!'
    const values = { name: 'world' }
    const result = format(templateContent, values)
    assert.strictEqual(result, 'Hello, world!')
  })

  it('should replace multiple inputs', () => {
    const templateContent = '{greeting}, {name}!'
    const values = { greeting: 'Hi', name: 'Alice' }
    const result = format(templateContent, values)
    assert.strictEqual(result, 'Hi, Alice!')
  })

  it('should handle templates with no inputs', () => {
    const templateContent = 'Hello, world!'
    const values = { name: 'John' }
    const result = format(templateContent, values)
    assert.strictEqual(result, 'Hello, world!')
  })

  it('should ignore extra values', () => {
    const templateContent = 'Hello, {name}!'
    const values = { name: 'world', age: 30 }
    const result = format(templateContent, values)
    assert.strictEqual(result, 'Hello, world!')
  })

  it('should replace missing inputs with an empty string when strict is false', () => {
    const templateContent = 'Hello, {name}!'
    const values = {}
    const options = { strict: false }
    const result = format(templateContent, values, options)
    assert.strictEqual(result, 'Hello, !')
  })

  it('should throw an error for missing values when strict is true', () => {
    const templateContent = 'Hello, {name}!'
    const values = {}
    const options = { strict: true }
    assert.throws(
      () => format(templateContent, values, options),
      new Error("Missing input values for: 'name'"),
    )
  })

  it('should not throw an error when all values are present and strict is true', () => {
    const templateContent = 'Hello, {name}!'
    const values = { name: 'world' }
    const options = { strict: true }
    const result = format(templateContent, values, options)
    assert.strictEqual(result, 'Hello, world!')
  })

  it('should work with custom delimiters', () => {
    const templateContent = '[[greeting]], [[name]]!'
    const values = { greeting: 'Yo', name: 'Bob' }
    const options = { delimiters: { open: '[[', close: ']]' } }
    const result = format(templateContent, values, options)
    assert.strictEqual(result, 'Yo, Bob!')
  })

  it('should handle regex special characters in delimiters', () => {
    const templateContent = '$[greeting], $[name]!'
    const values = { greeting: 'Hey', name: 'Charlie' }
    const options = { delimiters: { open: '$[', close: ']' } }
    const result = format(templateContent, values, options)
    assert.strictEqual(result, 'Hey, Charlie!')
  })

  it('should handle whitespace around inputs', () => {
    const templateContent = 'Hello, {  name  }!'
    const values = { name: 'world' }
    const result = format(templateContent, values)
    assert.strictEqual(result, 'Hello, world!')
  })
})

describe('getInputs', () => {
  it('should get a single input', () => {
    const templateContent = 'Hello, {name}!'
    const result = getInputs(templateContent)
    assert.deepStrictEqual(result, ['name'])
  })

  it('should get multiple inputs', () => {
    const templateContent = '{greeting}, {name}!'
    const result = getInputs(templateContent)
    assert.deepStrictEqual(result, ['greeting', 'name'])
  })

  it('should handle duplicate inputs', () => {
    const templateContent = '{name}, {name}!'
    const result = getInputs(templateContent)
    assert.deepStrictEqual(result, ['name', 'name'])
  })

  it('should return an empty array for templates with no inputs', () => {
    const templateContent = 'Hello, world!'
    const result = getInputs(templateContent)
    assert.deepStrictEqual(result, [])
  })

  it('should work with custom delimiters', () => {
    const templateContent = '[[greeting]], [[name]]!'
    const delimiters = { open: '[[', close: ']]' }
    const result = getInputs(templateContent, delimiters)
    assert.deepStrictEqual(result, ['greeting', 'name'])
  })

  it('should handle regex special characters in delimiters', () => {
    const templateContent = '$[greeting], $[name]!'
    const delimiters = { open: '$[', close: ']' }
    const result = getInputs(templateContent, delimiters)
    assert.deepStrictEqual(result, ['greeting', 'name'])
  })

  it('should handle whitespace around inputs', () => {
    const templateContent = 'Hello, {  name  }!'
    const result = getInputs(templateContent)
    assert.deepStrictEqual(result, ['name'])
  })
})

describe('read and readSync', () => {
  it('should read a template file and extract inputs', async () => {
    const templateFilePath = path.join(templatesDirPath, 'simple.md')
    const template = await read(templateFilePath)
    assert.strictEqual(template.content, 'Hello, {name}!\n')
    assert.deepStrictEqual(template.inputs, ['name'])
    assert.deepStrictEqual(template.options, {})

    const templateSync = readSync(templateFilePath)
    assert.strictEqual(templateSync.content, 'Hello, {name}!\n')
    assert.deepStrictEqual(templateSync.inputs, ['name'])
    assert.deepStrictEqual(templateSync.options, {})
  })

  it('should parse front matter options', async () => {
    const templateFilePath = path.join(templatesDirPath, 'front-matter.md')
    const template = await read(templateFilePath)
    assert.strictEqual(template.content, '\nHello, <<name>>!\n')
    assert.deepStrictEqual(template.inputs, ['name'])
    assert.deepStrictEqual(template.options, {
      delimiters: { open: '<<', close: '>>' },
      strict: false,
    })

    const templateSync = readSync(templateFilePath)
    assert.strictEqual(templateSync.content, '\nHello, <<name>>!\n')
    assert.deepStrictEqual(templateSync.inputs, ['name'])
    assert.deepStrictEqual(templateSync.options, {
      delimiters: { open: '<<', close: '>>' },
      strict: false,
    })
  })

  it('should override front matter options with provided options', async () => {
    const templateFilePath = path.join(templatesDirPath, 'override.md')
    const template = await read(templateFilePath, {
      strict: false,
      delimiters: { open: '{{', close: '}}' },
    })

    assert.strictEqual(template.content, '\nHello, <<name>> and {{other}}!\n')
    assert.deepStrictEqual(template.inputs, ['other'])
    assert.deepStrictEqual(template.options, {
      delimiters: { open: '{{', close: '}}' },
      strict: false,
    })

    const templateSync = readSync(templateFilePath, {
      strict: false,
      delimiters: { open: '{{', close: '}}' },
    })
    assert.strictEqual(
      templateSync.content,
      '\nHello, <<name>> and {{other}}!\n',
    )
    assert.deepStrictEqual(templateSync.inputs, ['other'])
    assert.deepStrictEqual(templateSync.options, {
      delimiters: { open: '{{', close: '}}' },
      strict: false,
    })
  })
})
