import assert from 'assert'
import { describe, it, beforeEach } from 'node:test'
import sinon from 'sinon'
import { AgentExtension } from '../../../src/app/extensions'
import { AgentApplication } from '../../../src/app/agentApplication'
import { TurnContext } from '../../../src/turnContext'
import { TurnState } from '../../../src/app/turnState'
import { Activity, ActivityTypes } from '@microsoft/agents-activity'
import { RouteRank } from '../../../src/app/routeRank'
import { TestAdapter } from '../testStubs'

describe('AgentExtension', () => {
  let extension: AgentExtension<TurnState>
  let mockApp: sinon.SinonStubbedInstance<AgentApplication<TurnState>>
  let context: TurnContext
  let testAdapter: TestAdapter

  beforeEach(() => {
    extension = new AgentExtension('test-channel')
    
    // Mock AgentApplication
    mockApp = sinon.createStubInstance(AgentApplication)
    
    // Create test context
    const activity = Activity.fromObject({
      type: ActivityTypes.Message,
      text: 'test message',
      channelId: 'test-channel',
      from: { id: 'user1', name: 'User' },
      recipient: { id: 'bot1', name: 'Bot' },
      conversation: { id: 'conversation1' }
    })
    
    testAdapter = new TestAdapter()
    context = new TurnContext(testAdapter, activity)
  })

  it('should create AgentExtension with channel ID', () => {
    const channelId = 'msteams'
    const extension = new AgentExtension(channelId)
    
    assert.strictEqual(extension.channelId, channelId)
  })

  it('should create AgentExtension with empty channel ID', () => {
    const extension = new AgentExtension('')
    
    assert.strictEqual(extension.channelId, '')
  })

  it('should add route with channel check', () => {
    const routeSelector = sinon.stub().returns(true)
    const routeHandler = sinon.stub()
    
    extension.addRoute(mockApp as any, routeSelector, routeHandler)
    
    assert(mockApp.addRoute.calledOnce)
    
    // Verify the arguments passed to addRoute
    const [wrappedSelector, handler, isInvokeRoute, rank] = mockApp.addRoute.getCall(0).args
    
    assert.strictEqual(handler, routeHandler)
    assert.strictEqual(isInvokeRoute, false)
    assert.strictEqual(rank, RouteRank.Unspecified)
    
    // Test the wrapped selector
    assert.strictEqual(typeof wrappedSelector, 'function')
  })

  it('should add route with custom parameters', () => {
    const routeSelector = sinon.stub().returns(true)
    const routeHandler = sinon.stub()
    const isInvokeRoute = true
    const rank = RouteRank.Highest
    
    extension.addRoute(mockApp as any, routeSelector, routeHandler, isInvokeRoute, rank)
    
    assert(mockApp.addRoute.calledOnce)
    
    const [wrappedSelector, handler, invokeFlag, routeRank] = mockApp.addRoute.getCall(0).args
    
    assert.strictEqual(handler, routeHandler)
    assert.strictEqual(invokeFlag, true)
    assert.strictEqual(routeRank, RouteRank.Highest)
  })

  it('should create route selector that matches channel and original selector', async () => {
    const routeSelector = sinon.stub().returns(true)
    const routeHandler = sinon.stub()
    
    extension.addRoute(mockApp as any, routeSelector, routeHandler)
    
    // Get the wrapped selector
    const [wrappedSelector] = mockApp.addRoute.getCall(0).args
    
    // Test with matching channel
    const result = await wrappedSelector(context)
    
    assert.strictEqual(result, true)
    assert(routeSelector.calledOnceWith(context))
  })

  it('should create route selector that rejects when channel does not match', async () => {
    const routeSelector = sinon.stub().returns(true)
    const routeHandler = sinon.stub()
    
    // Create extension for different channel
    const differentExtension = new AgentExtension('different-channel')
    differentExtension.addRoute(mockApp as any, routeSelector, routeHandler)
    
    // Get the wrapped selector
    const [wrappedSelector] = mockApp.addRoute.getCall(0).args
    
    // Test with non-matching channel
    const result = await wrappedSelector(context)
    
    assert.strictEqual(result, false)
    // Original selector should not be called if channel doesn't match
    assert(routeSelector.notCalled)
  })

  it('should create route selector that rejects when original selector returns false', async () => {
    const routeSelector = sinon.stub().returns(false)
    const routeHandler = sinon.stub()
    
    extension.addRoute(mockApp as any, routeSelector, routeHandler)
    
    // Get the wrapped selector
    const [wrappedSelector] = mockApp.addRoute.getCall(0).args
    
    // Test with matching channel but failing selector
    const result = await wrappedSelector(context)
    
    assert.strictEqual(result, false)
    assert(routeSelector.calledOnceWith(context))
  })

  it('should handle context without channelId', async () => {
    const routeSelector = sinon.stub().returns(true)
    const routeHandler = sinon.stub()
    
    extension.addRoute(mockApp as any, routeSelector, routeHandler)
    
    // Create context without channelId
    const activityWithoutChannel = Activity.fromObject({
      type: ActivityTypes.Message,
      text: 'test message',
      from: { id: 'user1', name: 'User' },
      recipient: { id: 'bot1', name: 'Bot' },
      conversation: { id: 'conversation1' }
    })
    
    const contextWithoutChannel = new TurnContext(testAdapter, activityWithoutChannel)
    
    // Get the wrapped selector
    const [wrappedSelector] = mockApp.addRoute.getCall(0).args
    
    // Test with context that has no channelId
    const result = await wrappedSelector(contextWithoutChannel)
    
    assert.strictEqual(result, false)
    assert(routeSelector.notCalled)
  })

  it('should handle async route selectors', async () => {
    const routeSelector = sinon.stub().resolves(true)
    const routeHandler = sinon.stub()
    
    extension.addRoute(mockApp as any, routeSelector, routeHandler)
    
    // Get the wrapped selector
    const [wrappedSelector] = mockApp.addRoute.getCall(0).args
    
    // Test with async selector
    const result = await wrappedSelector(context)
    
    assert.strictEqual(result, true)
    assert(routeSelector.calledOnceWith(context))
  })

  it('should handle route selector that throws error', async () => {
    const routeSelector = sinon.stub().throws(new Error('Selector error'))
    const routeHandler = sinon.stub()
    
    extension.addRoute(mockApp as any, routeSelector, routeHandler)
    
    // Get the wrapped selector
    const [wrappedSelector] = mockApp.addRoute.getCall(0).args
    
    // Test with error-throwing selector
    await assert.rejects(
      () => wrappedSelector(context),
      { message: 'Selector error' }
    )
  })

  it('should handle different channel ID types', () => {
    const channels = ['msteams', 'slack', 'telegram', 'webchat', '']
    
    channels.forEach(channelId => {
      const ext = new AgentExtension(channelId)
      assert.strictEqual(ext.channelId, channelId)
    })
  })

  it('should add multiple routes for same extension', () => {
    const routeSelector1 = sinon.stub().returns(true)
    const routeHandler1 = sinon.stub()
    const routeSelector2 = sinon.stub().returns(true)
    const routeHandler2 = sinon.stub()
    
    extension.addRoute(mockApp as any, routeSelector1, routeHandler1)
    extension.addRoute(mockApp as any, routeSelector2, routeHandler2)
    
    assert.strictEqual(mockApp.addRoute.callCount, 2)
    
    // Verify both routes were added
    const firstCall = mockApp.addRoute.getCall(0)
    const secondCall = mockApp.addRoute.getCall(1)
    
    assert.strictEqual(firstCall.args[1], routeHandler1)
    assert.strictEqual(secondCall.args[1], routeHandler2)
  })
})