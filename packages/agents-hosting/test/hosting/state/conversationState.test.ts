import assert from 'assert'
import { describe, it, beforeEach, afterEach } from 'node:test'
import sinon from 'sinon'
import { ConversationState, UserState } from '../../../src'
import { Storage } from '@microsoft/agents-hosting'

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