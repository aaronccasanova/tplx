import { describe, it } from 'node:test'
import assert from 'node:assert'
import { getInputs, render } from '../src/index.js'

describe('render', () => {
  it('should replace a single input', () => {
    const tpl = 'Hello, {name}!'
    const values = { name: 'world' }
    const result = render(tpl, values)
    assert.strictEqual(result, 'Hello, world!')
  })

  it('should replace multiple inputs', () => {
    const tpl = '{greeting}, {name}!'
    const values = { greeting: 'Hi', name: 'Alice' }
    const result = render(tpl, values)
    assert.strictEqual(result, 'Hi, Alice!')
  })

  it('should handle templates with no inputs', () => {
    const tpl = 'Hello, world!'
    const values = { name: 'John' }
    const result = render(tpl, values)
    assert.strictEqual(result, 'Hello, world!')
  })

  it('should ignore extra values', () => {
    const tpl = 'Hello, {name}!'
    const values = { name: 'world', age: 30 }
    const result = render(tpl, values)
    assert.strictEqual(result, 'Hello, world!')
  })

  it('should replace missing inputs with an empty string when strict is false', () => {
    const tpl = 'Hello, {name}!'
    const values = {}
    const options = { strict: false }
    const result = render(tpl, values, options)
    assert.strictEqual(result, 'Hello, !')
  })

  it('should throw an error for missing values when strict is true', () => {
    const tpl = 'Hello, {name}!'
    const values = {}
    const options = { strict: true }
    assert.throws(
      () => render(tpl, values, options),
      new Error("Missing input values for: 'name'"),
    )
  })

  it('should not throw an error when all values are present and strict is true', () => {
    const tpl = 'Hello, {name}!'
    const values = { name: 'world' }
    const options = { strict: true }
    const result = render(tpl, values, options)
    assert.strictEqual(result, 'Hello, world!')
  })

  it('should work with custom delimiters', () => {
    const tpl = '[[greeting]], [[name]]!'
    const values = { greeting: 'Yo', name: 'Bob' }
    const options = { delimiters: { open: '[[', close: ']]' } }
    const result = render(tpl, values, options)
    assert.strictEqual(result, 'Yo, Bob!')
  })

  it('should handle regex special characters in delimiters', () => {
    const tpl = '$[greeting], $[name]!'
    const values = { greeting: 'Hey', name: 'Charlie' }
    const options = { delimiters: { open: '$[', close: ']' } }
    const result = render(tpl, values, options)
    assert.strictEqual(result, 'Hey, Charlie!')
  })

  it('should handle whitespace around inputs', () => {
    const tpl = 'Hello, {  name  }!'
    const values = { name: 'world' }
    const result = render(tpl, values)
    assert.strictEqual(result, 'Hello, world!')
  })
})

describe('getInputs', () => {
  it('should get a single input', () => {
    const tpl = 'Hello, {name}!'
    const result = getInputs(tpl)
    assert.deepStrictEqual(result, ['name'])
  })

  it('should get multiple inputs', () => {
    const tpl = '{greeting}, {name}!'
    const result = getInputs(tpl)
    assert.deepStrictEqual(result, ['greeting', 'name'])
  })

  it('should handle duplicate inputs', () => {
    const tpl = '{name}, {name}!'
    const result = getInputs(tpl)
    assert.deepStrictEqual(result, ['name', 'name'])
  })

  it('should return an empty array for templates with no inputs', () => {
    const tpl = 'Hello, world!'
    const result = getInputs(tpl)
    assert.deepStrictEqual(result, [])
  })

  it('should work with custom delimiters', () => {
    const tpl = '[[greeting]], [[name]]!'
    const delimiters = { open: '[[', close: ']]' }
    const result = getInputs(tpl, delimiters)
    assert.deepStrictEqual(result, ['greeting', 'name'])
  })

  it('should handle regex special characters in delimiters', () => {
    const tpl = '$[greeting], $[name]!'
    const delimiters = { open: '$[', close: ']' }
    const result = getInputs(tpl, delimiters)
    assert.deepStrictEqual(result, ['greeting', 'name'])
  })

  it('should handle whitespace around inputs', () => {
    const tpl = 'Hello, {  name  }!'
    const result = getInputs(tpl)
    assert.deepStrictEqual(result, ['name'])
  })
})
