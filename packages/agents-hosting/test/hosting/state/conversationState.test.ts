import assert from 'assert'
import { describe, it, beforeEach, afterEach } from 'node:test'
import sinon from 'sinon'
import { ConversationState, UserState, AgentState } from '../../../src'
import { Storage } from '@microsoft/agents-hosting'

describe('AgentState', () => {
  let mockStorage: Storage
  let agentState: AgentState

  beforeEach(() => {
    // Create a simple mock storage
    mockStorage = {
      read: async () => ({}),
      write: async () => {},
      delete: async () => {}
    }
    
    agentState = new AgentState(mockStorage)
  })

  it('should create AgentState with storage', () => {
    assert(agentState)
    assert.strictEqual(typeof agentState.getStorageKey, 'function')
    assert.strictEqual(typeof agentState.load, 'function')
    assert.strictEqual(typeof agentState.saveChanges, 'function')
    assert.strictEqual(typeof agentState.delete, 'function')
    assert.strictEqual(typeof agentState.createProperty, 'function')
  })

  it('should create property accessor', () => {
    const propertyName = 'testProperty'
    const property = agentState.createProperty(propertyName)

    assert(property)
    assert.strictEqual(typeof property.get, 'function')
    assert.strictEqual(typeof property.set, 'function')
    assert.strictEqual(typeof property.delete, 'function')
  })

  it('should create property accessor with default value', () => {
    const propertyName = 'testProperty'
    const defaultValue = { test: 'default' }
    const property = agentState.createProperty(propertyName, defaultValue)

    assert(property)
    assert.strictEqual(typeof property.get, 'function')
    assert.strictEqual(typeof property.set, 'function')
    assert.strictEqual(typeof property.delete, 'function')
  })

  it('should generate storage key', () => {
    const mockContext = {
      activity: {
        channelId: 'test-channel',
        conversation: { id: 'test-conversation' }
      }
    }

    const key = agentState.getStorageKey(mockContext as any)
    
    assert(key)
    assert.strictEqual(typeof key, 'string')
    assert(key.length > 0)
  })

  it('should handle multiple property accessors', () => {
    const property1 = agentState.createProperty('property1')
    const property2 = agentState.createProperty('property2')

    assert(property1)
    assert(property2)
    assert.notStrictEqual(property1, property2)
  })

  it('should validate property names', () => {
    // Test various property name formats
    const validNames = ['test', 'testProperty', 'test_property', 'test123']
    
    validNames.forEach(name => {
      assert.doesNotThrow(() => {
        agentState.createProperty(name)
      })
    })
  })
})

describe('ConversationState', () => {
  let sandbox: sinon.SinonSandbox
  let mockStorage: sinon.SinonStubbedInstance<Storage>

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockStorage = sandbox.createStubInstance(Object)
    
    // Mock storage methods
    Object.defineProperty(mockStorage, 'read', {
      value: sandbox.stub().resolves({}),
      configurable: true
    })
    Object.defineProperty(mockStorage, 'write', {
      value: sandbox.stub().resolves(),
      configurable: true
    })
    Object.defineProperty(mockStorage, 'delete', {
      value: sandbox.stub().resolves(),
      configurable: true
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should create ConversationState with storage', () => {
    const conversationState = new ConversationState(mockStorage)
    
    assert(conversationState)
    assert.strictEqual(typeof conversationState.getStorageKey, 'function')
    assert.strictEqual(typeof conversationState.load, 'function')
    assert.strictEqual(typeof conversationState.saveChanges, 'function')
    assert.strictEqual(typeof conversationState.delete, 'function')
  })

  it('should generate storage key based on conversation reference', () => {
    const conversationState = new ConversationState(mockStorage)
    const turnContext = {
      activity: {
        conversation: {
          id: 'test-conversation-id'
        },
        channelId: 'test-channel'
      }
    }
    
    const key = conversationState.getStorageKey(turnContext as any)
    
    assert(key)
    assert.strictEqual(typeof key, 'string')
    assert(key.includes('test-conversation-id'))
  })

  it('should handle conversation state creation with property accessors', () => {
    const conversationState = new ConversationState(mockStorage)
    const property = conversationState.createProperty('testProperty')
    
    assert(property)
    assert.strictEqual(typeof property.get, 'function')
    assert.strictEqual(typeof property.set, 'function')
    assert.strictEqual(typeof property.delete, 'function')
  })
})

describe('UserState', () => {
  let sandbox: sinon.SinonSandbox
  let mockStorage: sinon.SinonStubbedInstance<Storage>

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockStorage = sandbox.createStubInstance(Object)
    
    // Mock storage methods
    Object.defineProperty(mockStorage, 'read', {
      value: sandbox.stub().resolves({}),
      configurable: true
    })
    Object.defineProperty(mockStorage, 'write', {
      value: sandbox.stub().resolves(),
      configurable: true
    })
    Object.defineProperty(mockStorage, 'delete', {
      value: sandbox.stub().resolves(),
      configurable: true
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should create UserState with storage', () => {
    const userState = new UserState(mockStorage)
    
    assert(userState)
    assert.strictEqual(typeof userState.getStorageKey, 'function')
    assert.strictEqual(typeof userState.load, 'function')
    assert.strictEqual(typeof userState.saveChanges, 'function')
    assert.strictEqual(typeof userState.delete, 'function')
  })

  it('should generate storage key based on user ID', () => {
    const userState = new UserState(mockStorage)
    const turnContext = {
      activity: {
        from: {
          id: 'test-user-id'
        },
        channelId: 'test-channel'
      }
    }
    
    const key = userState.getStorageKey(turnContext as any)
    
    assert(key)
    assert.strictEqual(typeof key, 'string')
    assert(key.includes('test-user-id'))
  })

  it('should handle user state creation with property accessors', () => {
    const userState = new UserState(mockStorage)
    const property = userState.createProperty('testProperty')
    
    assert(property)
    assert.strictEqual(typeof property.get, 'function')
    assert.strictEqual(typeof property.set, 'function')
    assert.strictEqual(typeof property.delete, 'function')
  })
})