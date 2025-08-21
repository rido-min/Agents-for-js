import assert from 'assert'
import { describe, it, beforeEach, afterEach } from 'node:test'
import sinon from 'sinon'
import express from 'express'
import { ActivityHandler, AgentApplication, TurnState, CloudAdapter, AuthConfiguration } from '@microsoft/agents-hosting'

describe('startServer', () => {
  let sandbox: sinon.SinonSandbox
  let mockAgent: sinon.SinonStubbedInstance<ActivityHandler>
  let mockAgentApp: sinon.SinonStubbedInstance<AgentApplication<TurnState>>
  let authConfig: AuthConfiguration

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockAgent = sandbox.createStubInstance(ActivityHandler)
    mockAgentApp = sandbox.createStubInstance(AgentApplication<TurnState>)
    
    authConfig = {
      tenantId: 'test-tenant',
      clientId: 'test-client',
      clientSecret: 'test-secret',
      issuers: ['test-issuer']
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should export startServer function', () => {
    const { startServer } = require('../src')
    assert.strictEqual(typeof startServer, 'function')
  })

  it('should create express app when called with ActivityHandler', () => {
    // Mock process.env.PORT to avoid default port issues
    const originalPort = process.env.PORT
    process.env.PORT = '0' // Use port 0 to let the system assign an available port
    
    const { startServer } = require('../src')
    
    // Mock express.listen to prevent actual server start
    const originalListen = express.application.listen
    express.application.listen = sandbox.stub().returns({ on: sandbox.stub() })
    
    const server = startServer(mockAgent, authConfig)
    
    assert(server)
    assert.strictEqual(typeof server.use, 'function')
    assert.strictEqual(typeof server.post, 'function')
    
    // Restore
    express.application.listen = originalListen
    process.env.PORT = originalPort
  })

  it('should handle AgentApplication with adapter', () => {
    const originalPort = process.env.PORT
    process.env.PORT = '0'
    
    const { startServer } = require('../src')
    
    const mockAdapter = sandbox.createStubInstance(CloudAdapter)
    Object.defineProperty(mockAgentApp, 'adapter', {
      value: mockAdapter,
      configurable: true
    })
    Object.defineProperty(mockAgentApp, 'options', {
      value: { headerPropagation: undefined },
      configurable: true
    })
    
    const originalListen = express.application.listen
    express.application.listen = sandbox.stub().returns({ on: sandbox.stub() })
    
    const server = startServer(mockAgentApp, authConfig)
    
    assert(server)
    
    express.application.listen = originalListen
    process.env.PORT = originalPort
  })

  it('should handle AgentApplication without adapter', () => {
    const originalPort = process.env.PORT
    process.env.PORT = '0'
    
    const { startServer } = require('../src')
    
    Object.defineProperty(mockAgentApp, 'adapter', {
      value: undefined,
      configurable: true
    })
    
    const originalListen = express.application.listen
    express.application.listen = sandbox.stub().returns({ on: sandbox.stub() })
    
    const server = startServer(mockAgentApp, authConfig)
    
    assert(server)
    
    express.application.listen = originalListen
    process.env.PORT = originalPort
  })
})