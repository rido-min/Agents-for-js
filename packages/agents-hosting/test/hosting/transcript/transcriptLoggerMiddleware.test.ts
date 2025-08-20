import assert from 'assert'
import { describe, it } from 'node:test'

describe('TranscriptLoggerMiddleware', () => {
  it('should export TranscriptLoggerMiddleware class', () => {
    const { TranscriptLoggerMiddleware } = require('../../../src')
    assert.strictEqual(typeof TranscriptLoggerMiddleware, 'function')
  })

  it('should create TranscriptLoggerMiddleware with logger', () => {
    const { TranscriptLoggerMiddleware } = require('../../../src')
    
    // Create a simple mock logger
    const mockLogger = {
      logActivity: () => Promise.resolve()
    }
    
    const middleware = new TranscriptLoggerMiddleware(mockLogger as any)
    
    assert(middleware)
    assert.strictEqual(typeof middleware.onTurn, 'function')
  })

  it('should have onTurn method that accepts context and next', () => {
    const { TranscriptLoggerMiddleware } = require('../../../src')
    
    const mockLogger = {
      logActivity: () => Promise.resolve()
    }
    
    const middleware = new TranscriptLoggerMiddleware(mockLogger as any)
    
    // Check that onTurn exists and is a function
    assert.strictEqual(typeof middleware.onTurn, 'function')
    assert.strictEqual(middleware.onTurn.length, 2) // Should accept 2 parameters: context and next
  })
})