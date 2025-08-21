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

  it('should create TurnStateEntry with empty object when no value provided', () => {
    const entry = new TurnStateEntry()
    assert.deepStrictEqual(entry.value, {})
  })

  it('should create TurnStateEntry with storage key', () => {
    const value = { test: 'data' }
    const storageKey = 'test-storage-key'
    const entry = new TurnStateEntry(value, storageKey)

    assert.strictEqual(entry.storageKey, storageKey)
    assert.deepStrictEqual(entry.value, value)
  })

  it('should track changes correctly', () => {
    const entry = new TurnStateEntry({ count: 0 })
    
    // Initially should not have changed
    assert.strictEqual(entry.hasChanged, false)
    
    // Modify the value
    entry.value.count = 1
    
    // Should detect change
    assert.strictEqual(entry.hasChanged, true)
  })

  it('should track changes with nested objects', () => {
    const entry = new TurnStateEntry({ nested: { value: 'original' } })
    
    assert.strictEqual(entry.hasChanged, false)
    
    // Modify nested property
    (entry.value.nested as any).value = 'modified'
    
    assert.strictEqual(entry.hasChanged, true)
  })

  it('should handle deletion state', () => {
    const entry = new TurnStateEntry({ test: 'data' })
    
    // Initially not deleted
    assert.strictEqual(entry.isDeleted, false)
    
    // Mark for deletion
    entry.delete()
    assert.strictEqual(entry.isDeleted, true)
  })

  it('should reset value when accessing after deletion', () => {
    const entry = new TurnStateEntry({ test: 'data' })
    
    // Mark for deletion
    entry.delete()
    assert.strictEqual(entry.isDeleted, true)
    
    // Accessing value should reset to empty object and clear deletion flag
    const value = entry.value
    assert.deepStrictEqual(value, {})
    assert.strictEqual(entry.isDeleted, false)
  })

  it('should replace value correctly', () => {
    const entry = new TurnStateEntry({ original: 'data' })
    const newValue = { replaced: 'value' }
    
    entry.replace(newValue)
    assert.deepStrictEqual(entry.value, newValue)
  })

  it('should replace with empty object when undefined provided', () => {
    const entry = new TurnStateEntry({ original: 'data' })
    
    entry.replace(undefined)
    assert.deepStrictEqual(entry.value, {})
  })

  it('should handle complex object values', () => {
    const complexValue = {
      string: 'test',
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      nested: {
        prop: 'value',
        deepNested: {
          level: 3
        }
      },
      nullValue: null,
      undefinedValue: undefined
    }
    
    const entry = new TurnStateEntry(complexValue)
    assert.deepStrictEqual(entry.value, complexValue)
  })

  it('should track changes after replace', () => {
    const entry = new TurnStateEntry({ original: 'data' })
    
    // Replace with new value
    entry.replace({ replaced: 'value' })
    
    // Should not show as changed immediately after replace
    assert.strictEqual(entry.hasChanged, false)
    
    // Modify the replaced value
    entry.value.newProp = 'added'
    
    // Should show as changed
    assert.strictEqual(entry.hasChanged, true)
  })

  it('should handle deletion and replacement cycle', () => {
    const entry = new TurnStateEntry({ original: 'data' })
    
    // Delete
    entry.delete()
    assert.strictEqual(entry.isDeleted, true)
    
    // Access value (resets)
    const resetValue = entry.value
    assert.deepStrictEqual(resetValue, {})
    assert.strictEqual(entry.isDeleted, false)
    
    // Replace with new value
    entry.replace({ new: 'data' })
    assert.deepStrictEqual(entry.value, { new: 'data' })
  })

  it('should handle different value types', () => {
    const stringEntry = new TurnStateEntry('string' as any)
    const numberEntry = new TurnStateEntry(42 as any)
    const objectEntry = new TurnStateEntry({ prop: 'value' })

    assert.strictEqual(stringEntry.value, 'string')
    assert.strictEqual(numberEntry.value, 42)
    assert.deepStrictEqual(objectEntry.value, { prop: 'value' })
  })

  it('should handle null and undefined values', () => {
    const nullEntry = new TurnStateEntry(null as any)
    const undefinedEntry = new TurnStateEntry(undefined)

    assert.strictEqual(nullEntry.value, null)
    assert.deepStrictEqual(undefinedEntry.value, {})
  })

  it('should detect no change when value is not modified', () => {
    const entry = new TurnStateEntry({ count: 0 })
    
    // Read value multiple times without modification
    const value1 = entry.value
    const value2 = entry.value
    
    assert.strictEqual(entry.hasChanged, false)
    assert.strictEqual(value1, value2)
  })

  it('should handle empty storage key', () => {
    const entry = new TurnStateEntry({ test: 'data' }, '')
    assert.strictEqual(entry.storageKey, '')
  })

  it('should handle undefined storage key', () => {
    const entry = new TurnStateEntry({ test: 'data' })
    assert.strictEqual(entry.storageKey, undefined)
  })
})