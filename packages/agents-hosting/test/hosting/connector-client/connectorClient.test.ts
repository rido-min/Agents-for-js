import assert from 'assert'
import { describe, it, beforeEach, afterEach } from 'node:test'
import sinon from 'sinon'
import { ConnectorClient, getProductInfo } from '../../../src'
import { AuthConfiguration } from '@microsoft/agents-hosting'

describe('ConnectorClient', () => {
  let sandbox: sinon.SinonSandbox
  let authConfig: AuthConfiguration

  beforeEach(() => {
    sandbox = sinon.createSandbox()
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

  it('should export ConnectorClient class', () => {
    assert.strictEqual(typeof ConnectorClient, 'function')
  })

  it('should create ConnectorClient with auth configuration', async () => {
    const client = await ConnectorClient.create(authConfig, 'https://test.serviceurl')
    
    assert(client)
    assert.strictEqual(typeof client.sendToConversation, 'function')
    assert.strictEqual(typeof client.replyToActivity, 'function')
    assert.strictEqual(typeof client.updateActivity, 'function')
    assert.strictEqual(typeof client.deleteActivity, 'function')
  })

  it('should create ConnectorClient with custom service URL', async () => {
    const customServiceUrl = 'https://custom.service.url'
    const client = await ConnectorClient.create(authConfig, customServiceUrl)
    
    assert(client)
  })

  it('should have HTTP methods', async () => {
    const client = await ConnectorClient.create(authConfig, 'https://test.serviceurl')
    
    // Check HTTP methods exist
    assert.strictEqual(typeof client.sendToConversation, 'function')
    assert.strictEqual(typeof client.replyToActivity, 'function')
    assert.strictEqual(typeof client.updateActivity, 'function')
    assert.strictEqual(typeof client.deleteActivity, 'function')
    assert.strictEqual(typeof client.createConversation, 'function')
    assert.strictEqual(typeof client.getConversations, 'function')
    assert.strictEqual(typeof client.getConversationMembers, 'function')
    assert.strictEqual(typeof client.getActivityMembers, 'function')
    assert.strictEqual(typeof client.uploadAttachment, 'function')
  })
})

describe('getProductInfo', () => {
  it('should return product information', () => {
    const productInfo = getProductInfo()
    
    assert(productInfo)
    assert.strictEqual(typeof productInfo, 'object')
    assert.strictEqual(typeof productInfo.userAgent, 'string')
    assert(productInfo.userAgent.length > 0)
  })

  it('should include version information', () => {
    const productInfo = getProductInfo()
    
    // Should have some form of version info
    assert(productInfo.userAgent.includes('agents-hosting'))
  })
})