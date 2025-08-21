import assert from 'assert'
import { describe, it, beforeEach } from 'node:test'
import sinon from 'sinon'
import { TranscriptLoggerMiddleware } from '../../../src/transcript/transcriptLoggerMiddleware'
import { TranscriptLogger } from '../../../src/transcript/transcriptLogger'
import { TurnContext } from '../../../src/turnContext'
import { Activity, ActivityTypes, RoleTypes, ActivityEventNames } from '@microsoft/agents-activity'
import { TestAdapter } from '../testStubs'

describe('TranscriptLoggerMiddleware', () => {
  let mockLogger: sinon.SinonStubbedInstance<TranscriptLogger>
  let middleware: TranscriptLoggerMiddleware
  let testAdapter: TestAdapter
  let activity: Activity
  let context: TurnContext

  beforeEach(() => {
    mockLogger = sinon.createStubInstance(class MockLogger implements TranscriptLogger {
      logActivity(activity: Activity): void | Promise<void> {
        return Promise.resolve()
      }
    })
    
    middleware = new TranscriptLoggerMiddleware(mockLogger as any)
    
    activity = Activity.fromObject({
      type: ActivityTypes.Message,
      text: 'test message',
      from: { id: 'user1', name: 'User' },
      recipient: { id: 'bot1', name: 'Bot' },
      conversation: { id: 'conversation1' },
      channelId: 'test'
    })
    
    testAdapter = new TestAdapter()
    context = new TurnContext(testAdapter, activity)
  })

  it('should export TranscriptLoggerMiddleware class', () => {
    const { TranscriptLoggerMiddleware } = require('../../../src')
    assert.strictEqual(typeof TranscriptLoggerMiddleware, 'function')
  })

  it('should create TranscriptLoggerMiddleware with logger', () => {
    const mockLogger = {
      logActivity: () => Promise.resolve()
    }
    
    const middleware = new TranscriptLoggerMiddleware(mockLogger as any)
    
    assert(middleware)
    assert.strictEqual(typeof middleware.onTurn, 'function')
  })

  it('should throw error when created without logger', () => {
    assert.throws(
      () => new TranscriptLoggerMiddleware(null as any),
      { message: 'TranscriptLoggerMiddleware requires a TranscriptLogger instance.' }
    )
  })

  it('should set user role if not provided in activity', async () => {
    activity.from!.role = undefined
    
    let next = sinon.stub().resolves()
    
    await middleware.onTurn(context, next)
    
    assert.strictEqual(activity.from!.role, RoleTypes.User)
    assert(next.calledOnce)
  })

  it('should log incoming activity with timestamp', async () => {
    const originalTimestamp = activity.timestamp
    activity.timestamp = undefined
    
    let next = sinon.stub().resolves()
    
    await middleware.onTurn(context, next)
    
    assert(mockLogger.logActivity.called)
    const loggedActivity = mockLogger.logActivity.getCall(0).args[0]
    assert(loggedActivity.timestamp instanceof Date)
  })

  it('should log outgoing activities with generated IDs', async () => {
    const outgoingActivity = {
      type: ActivityTypes.Message,
      text: 'bot response'
    }
    
    let next = sinon.stub().resolves()
    
    // Setup context to capture send activities handler
    let sendActivitiesHandler: any
    context.onSendActivities = sinon.stub().callsFake((handler) => {
      sendActivitiesHandler = handler
    })
    
    await middleware.onTurn(context, next)
    
    // Simulate sending activities
    const mockNext = sinon.stub().resolves([{ id: 'response123' }])
    await sendActivitiesHandler(context, [outgoingActivity], mockNext)
    
    // Should have logged both incoming and outgoing activities
    assert(mockLogger.logActivity.calledTwice)
    const outgoingLoggedActivity = mockLogger.logActivity.getCall(1).args[0]
    assert.strictEqual(outgoingLoggedActivity.id, 'response123')
  })

  it('should generate ID for outgoing activity when response has no ID', async () => {
    const outgoingActivity = {
      type: ActivityTypes.Message,
      text: 'bot response',
      timestamp: new Date('2023-01-01T00:00:00Z')
    }
    
    let next = sinon.stub().resolves()
    
    let sendActivitiesHandler: any
    context.onSendActivities = sinon.stub().callsFake((handler) => {
      sendActivitiesHandler = handler
    })
    
    await middleware.onTurn(context, next)
    
    // Simulate sending activities with no ID in response
    const mockNext = sinon.stub().resolves([{}])
    await sendActivitiesHandler(context, [outgoingActivity], mockNext)
    
    assert(mockLogger.logActivity.calledTwice)
    const outgoingLoggedActivity = mockLogger.logActivity.getCall(1).args[0]
    assert(outgoingLoggedActivity.id)
    assert(outgoingLoggedActivity.id.startsWith('g_'))
  })

  it('should log update activities as MessageUpdate type', async () => {
    const updateActivity = {
      type: ActivityTypes.Message,
      text: 'updated message',
      id: 'msg123'
    }
    
    let next = sinon.stub().resolves()
    
    let updateActivityHandler: any
    context.onUpdateActivity = sinon.stub().callsFake((handler) => {
      updateActivityHandler = handler
    })
    
    await middleware.onTurn(context, next)
    
    // Simulate update activity
    const mockNext = sinon.stub().resolves()
    await updateActivityHandler(context, updateActivity, mockNext)
    
    // Should have logged incoming activity and update activity
    assert(mockLogger.logActivity.calledTwice)
    const updateLoggedActivity = mockLogger.logActivity.getCall(1).args[0]
    assert.strictEqual(updateLoggedActivity.type, ActivityTypes.MessageUpdate)
  })

  it('should handle delete activity callback without error', async () => {
    const conversationReference = {
      activityId: 'msg123',
      conversation: { id: 'conversation1' }
    }
    
    let next = sinon.stub().resolves()
    
    let deleteActivityHandler: any
    context.onDeleteActivity = sinon.stub().callsFake((handler) => {
      deleteActivityHandler = handler
    })
    
    await middleware.onTurn(context, next)
    
    // Simulate delete activity
    const mockNext = sinon.stub().resolves()
    await deleteActivityHandler(context, conversationReference, mockNext)
    
    // Should only have logged incoming activity (delete is commented out)
    assert(mockLogger.logActivity.calledOnce)
  })

  it('should skip logging ContinueConversation events', async () => {
    const continueActivity = Activity.fromObject({
      type: ActivityTypes.Event,
      name: ActivityEventNames.ContinueConversation,
      from: { id: 'user1', name: 'User' },
      recipient: { id: 'bot1', name: 'Bot' },
      conversation: { id: 'conversation1' },
      channelId: 'test'
    })
    
    const context = new TurnContext(testAdapter, continueActivity)
    let next = sinon.stub().resolves()
    
    await middleware.onTurn(context, next)
    
    // Should not log ContinueConversation events
    assert(mockLogger.logActivity.notCalled)
  })

  it('should handle logger errors gracefully when logger returns Promise', async () => {
    const errorLogger = {
      logActivity: sinon.stub().rejects(new Error('Logging failed'))
    }
    
    const errorMiddleware = new TranscriptLoggerMiddleware(errorLogger as any)
    let next = sinon.stub().resolves()
    
    // Should not throw error even if logging fails
    await errorMiddleware.onTurn(context, next)
    
    assert(next.calledOnce)
  })

  it('should handle logger errors gracefully when logger throws synchronously', async () => {
    const errorLogger = {
      logActivity: sinon.stub().throws(new Error('Sync logging failed'))
    }
    
    const errorMiddleware = new TranscriptLoggerMiddleware(errorLogger as any)
    let next = sinon.stub().resolves()
    
    // Should not throw error even if logging fails
    await errorMiddleware.onTurn(context, next)
    
    assert(next.calledOnce)
  })

  it('should handle non-Error objects in error handler', async () => {
    const errorLogger = {
      logActivity: sinon.stub().throws('String error')
    }
    
    const errorMiddleware = new TranscriptLoggerMiddleware(errorLogger as any)
    let next = sinon.stub().resolves()
    
    // Should not throw error even if logging fails with non-Error
    await errorMiddleware.onTurn(context, next)
    
    assert(next.calledOnce)
  })

  it('should handle activities without from field', async () => {
    const activityWithoutFrom = Activity.fromObject({
      type: ActivityTypes.Message,
      text: 'test message',
      recipient: { id: 'bot1', name: 'Bot' },
      conversation: { id: 'conversation1' },
      channelId: 'test'
    })
    
    const context = new TurnContext(testAdapter, activityWithoutFrom)
    let next = sinon.stub().resolves()
    
    await middleware.onTurn(context, next)
    
    // Should still call next even without from field
    assert(next.calledOnce)
  })
})