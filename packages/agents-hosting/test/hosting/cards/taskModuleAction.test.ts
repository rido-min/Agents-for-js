import assert from 'assert'
import { describe, it } from 'node:test'
import { TaskModuleAction } from '../../../src/cards/taskModuleAction'

describe('TaskModuleAction', () => {
  it('should create TaskModuleAction with title and value', () => {
    const title = 'Test Action'
    const value = { data: 'test' }
    
    const action = new TaskModuleAction(title, value)
    
    assert.strictEqual(action.type, 'invoke')
    assert.strictEqual(action.title, title)
    assert.deepStrictEqual(action.value, { data: 'test', type: 'task/fetch' })
  })

  it('should handle undefined value by creating empty object', () => {
    const title = 'Test Action'
    
    const action = new TaskModuleAction(title, undefined)
    
    assert.strictEqual(action.type, 'invoke')
    assert.strictEqual(action.title, title)
    assert.deepStrictEqual(action.value, { type: 'task/fetch' })
  })

  it('should handle null value by creating empty object', () => {
    const title = 'Test Action'
    
    const action = new TaskModuleAction(title, null)
    
    assert.strictEqual(action.type, 'invoke')
    assert.strictEqual(action.title, title)
    assert.deepStrictEqual(action.value, { type: 'task/fetch' })
  })

  it('should handle object value by using it directly', () => {
    const title = 'Test Action'
    const value = { existingProp: 'value', anotherProp: 42 }
    
    const action = new TaskModuleAction(title, value)
    
    assert.strictEqual(action.type, 'invoke')
    assert.strictEqual(action.title, title)
    assert.deepStrictEqual(action.value, { 
      existingProp: 'value', 
      anotherProp: 42, 
      type: 'task/fetch' 
    })
  })

  it('should handle string value by parsing as JSON', () => {
    const title = 'Test Action'
    const value = '{"parsed": "json", "number": 123}'
    
    const action = new TaskModuleAction(title, value)
    
    assert.strictEqual(action.type, 'invoke')
    assert.strictEqual(action.title, title)
    assert.deepStrictEqual(action.value, { 
      parsed: 'json', 
      number: 123, 
      type: 'task/fetch' 
    })
  })

  it('should handle empty string value', () => {
    const title = 'Test Action'
    const value = ''
    
    const action = new TaskModuleAction(title, value)
    
    assert.strictEqual(action.type, 'invoke')
    assert.strictEqual(action.title, title)
  })

  it('should handle empty object string', () => {
    const title = 'Test Action'
    const value = '{}'
    
    const action = new TaskModuleAction(title, value)
    
    assert.strictEqual(action.type, 'invoke')
    assert.strictEqual(action.title, title)
    assert.deepStrictEqual(action.value, { type: 'task/fetch' })
  })

  it('should always add task/fetch type to value', () => {
    const title = 'Test Action'
    const value = { existing: 'data', type: 'other/type' }
    
    const action = new TaskModuleAction(title, value)
    
    // Should override existing type with 'task/fetch'
    assert.deepStrictEqual(action.value, { 
      existing: 'data', 
      type: 'task/fetch' 
    })
  })

  it('should handle complex nested object', () => {
    const title = 'Complex Action'
    const value = {
      level1: {
        level2: {
          data: 'nested',
          array: [1, 2, 3]
        }
      },
      otherProp: true
    }
    
    const action = new TaskModuleAction(title, value)
    
    assert.strictEqual(action.type, 'invoke')
    assert.strictEqual(action.title, title)
    assert.deepStrictEqual(action.value, {
      level1: {
        level2: {
          data: 'nested',
          array: [1, 2, 3]
        }
      },
      otherProp: true,
      type: 'task/fetch'
    })
  })

  it('should throw error for invalid JSON string', () => {
    const title = 'Test Action'
    const invalidJson = '{"invalid": json}'
    
    assert.throws(() => {
      new TaskModuleAction(title, invalidJson)
    }, SyntaxError)
  })

  it('should throw error when number value results in non-object data', () => {
    const title = 'Test Action'
    const value = 42
    
    assert.throws(() => {
      new TaskModuleAction(title, value)
    }, TypeError)
  })

  it('should have all CardAction properties', () => {
    const action = new TaskModuleAction('test', {})
    
    // Check that all CardAction properties are available
    assert(action.hasOwnProperty('type'))
    assert(action.hasOwnProperty('title'))
    assert(action.hasOwnProperty('image'))
    assert(action.hasOwnProperty('text'))
    assert(action.hasOwnProperty('displayText'))
    assert(action.hasOwnProperty('value'))
    assert(action.hasOwnProperty('channelData'))
    assert(action.hasOwnProperty('imageAltText'))
  })

  it('should allow setting optional properties', () => {
    const action = new TaskModuleAction('test', {})
    
    action.image = 'image.png'
    action.text = 'Action text'
    action.displayText = 'Display text'
    action.channelData = { channel: 'data' }
    action.imageAltText = 'Alt text'
    
    assert.strictEqual(action.image, 'image.png')
    assert.strictEqual(action.text, 'Action text')
    assert.strictEqual(action.displayText, 'Display text')
    assert.deepStrictEqual(action.channelData, { channel: 'data' })
    assert.strictEqual(action.imageAltText, 'Alt text')
  })
})