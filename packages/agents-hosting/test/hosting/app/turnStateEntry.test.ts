import assert from 'assert'
import { describe, it, beforeEach } from 'node:test'
import { TurnState, TurnStateEntry } from '../../../src'

describe('TurnState', () => {
  let turnState: TurnState

  beforeEach(() => {
    turnState = new TurnState()
  })

  it('should create TurnState instance', () => {
    assert(turnState)
    assert.strictEqual(typeof turnState.get, 'function')
    assert.strictEqual(typeof turnState.set, 'function')
    assert.strictEqual(typeof turnState.has, 'function')
    assert.strictEqual(typeof turnState.delete, 'function')
  })

  it('should set and get values', () => {
    const key = 'test-key'
    const value = { test: 'value' }

    turnState.set(key, value)
    const result = turnState.get(key)

    assert.deepStrictEqual(result, value)
  })

  it('should check if key exists', () => {
    const key = 'test-key'
    const value = 'test-value'

    assert.strictEqual(turnState.has(key), false)
    
    turnState.set(key, value)
    assert.strictEqual(turnState.has(key), true)
  })

  it('should delete keys', () => {
    const key = 'test-key'
    const value = 'test-value'

    turnState.set(key, value)
    assert.strictEqual(turnState.has(key), true)
    
    turnState.delete(key)
    assert.strictEqual(turnState.has(key), false)
  })

  it('should return undefined for non-existent keys', () => {
    const result = turnState.get('non-existent-key')
    assert.strictEqual(result, undefined)
  })

  it('should work with different value types', () => {
    turnState.set('string', 'test')
    turnState.set('number', 42)
    turnState.set('boolean', true)
    turnState.set('object', { prop: 'value' })
    turnState.set('array', [1, 2, 3])

    assert.strictEqual(turnState.get('string'), 'test')
    assert.strictEqual(turnState.get('number'), 42)
    assert.strictEqual(turnState.get('boolean'), true)
    assert.deepStrictEqual(turnState.get('object'), { prop: 'value' })
    assert.deepStrictEqual(turnState.get('array'), [1, 2, 3])
  })

  it('should work with symbol keys', () => {
    const sym = Symbol('test-symbol')
    const value = 'symbol-value'

    turnState.set(sym, value)
    assert.strictEqual(turnState.get(sym), value)
    assert.strictEqual(turnState.has(sym), true)
  })

  it('should handle null and undefined values', () => {
    turnState.set('null-key', null)
    turnState.set('undefined-key', undefined)

    assert.strictEqual(turnState.get('null-key'), null)
    assert.strictEqual(turnState.get('undefined-key'), undefined)
    assert.strictEqual(turnState.has('null-key'), true)
    assert.strictEqual(turnState.has('undefined-key'), true)
  })
})

describe('TurnStateEntry', () => {
  it('should create TurnStateEntry with value', () => {
    const value = { test: 'data' }
    const entry = new TurnStateEntry(value)

    assert(entry)
    assert.deepStrictEqual(entry.value, value)
  })

  it('should handle different value types', () => {
    const stringEntry = new TurnStateEntry('string')
    const numberEntry = new TurnStateEntry(42)
    const objectEntry = new TurnStateEntry({ prop: 'value' })

    assert.strictEqual(stringEntry.value, 'string')
    assert.strictEqual(numberEntry.value, 42)
    assert.deepStrictEqual(objectEntry.value, { prop: 'value' })
  })

  it('should handle null and undefined values', () => {
    const nullEntry = new TurnStateEntry(null)
    const undefinedEntry = new TurnStateEntry(undefined)

    assert.strictEqual(nullEntry.value, null)
    assert.strictEqual(undefinedEntry.value, undefined)
  })
})