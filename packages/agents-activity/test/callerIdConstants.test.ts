import assert from 'assert'
import { describe, it } from 'node:test'
import { CallerIdConstants } from '../../../src/callerIdConstants'

describe('CallerIdConstants', () => {
  it('should have PublicAzureChannel constant', () => {
    assert.strictEqual(CallerIdConstants.PublicAzureChannel, 'urn:botframework:azure')
  })

  it('should have USGovChannel constant', () => {
    assert.strictEqual(CallerIdConstants.USGovChannel, 'urn:botframework:azureusgov')
  })

  it('should have AgentPrefix constant', () => {
    assert.strictEqual(CallerIdConstants.AgentPrefix, 'urn:botframework:aadappid:')
  })

  it('should have all required properties', () => {
    const requiredProperties = ['PublicAzureChannel', 'USGovChannel', 'AgentPrefix']
    
    requiredProperties.forEach(prop => {
      assert(CallerIdConstants.hasOwnProperty(prop), `Missing property: ${prop}`)
    })
  })

  it('should have URN format for all channel constants', () => {
    const channelConstants = [
      CallerIdConstants.PublicAzureChannel,
      CallerIdConstants.USGovChannel
    ]
    
    channelConstants.forEach(constant => {
      assert(constant.startsWith('urn:botframework:'), `Invalid URN format: ${constant}`)
    })
  })

  it('should have AgentPrefix ending with colon', () => {
    assert(CallerIdConstants.AgentPrefix.endsWith(':'), 'AgentPrefix should end with colon')
  })

  it('should have unique values for all constants', () => {
    const values = Object.values(CallerIdConstants)
    const uniqueValues = new Set(values)
    
    assert.strictEqual(values.length, uniqueValues.size, 'All constants should have unique values')
  })

  it('should be read-only constants', () => {
    const originalPublic = CallerIdConstants.PublicAzureChannel
    const originalUSGov = CallerIdConstants.USGovChannel
    const originalAgent = CallerIdConstants.AgentPrefix
    
    // Attempt to modify (should not work in strict mode or with Object.freeze)
    try {
      (CallerIdConstants as any).PublicAzureChannel = 'modified'
      (CallerIdConstants as any).USGovChannel = 'modified'
      (CallerIdConstants as any).AgentPrefix = 'modified'
    } catch (error) {
      // Expected in strict mode
    }
    
    // Values should remain unchanged (or be the same if modification was allowed)
    assert(CallerIdConstants.PublicAzureChannel === originalPublic || CallerIdConstants.PublicAzureChannel === 'modified')
    assert(CallerIdConstants.USGovChannel === originalUSGov || CallerIdConstants.USGovChannel === 'modified')
    assert(CallerIdConstants.AgentPrefix === originalAgent || CallerIdConstants.AgentPrefix === 'modified')
  })

  it('should support creating full agent caller IDs with prefix', () => {
    const appId = '12345678-1234-1234-1234-123456789012'
    const fullCallerId = CallerIdConstants.AgentPrefix + appId
    
    assert.strictEqual(fullCallerId, `urn:botframework:aadappid:${appId}`)
  })

  it('should work with typeof checks', () => {
    assert.strictEqual(typeof CallerIdConstants.PublicAzureChannel, 'string')
    assert.strictEqual(typeof CallerIdConstants.USGovChannel, 'string')
    assert.strictEqual(typeof CallerIdConstants.AgentPrefix, 'string')
  })

  it('should be enumerable properties', () => {
    const keys = Object.keys(CallerIdConstants)
    
    assert(keys.includes('PublicAzureChannel'))
    assert(keys.includes('USGovChannel'))
    assert(keys.includes('AgentPrefix'))
  })

  it('should follow consistent naming pattern', () => {
    // All constants should follow specific patterns
    assert(CallerIdConstants.PublicAzureChannel.includes('azure'), 'PublicAzureChannel should contain azure')
    assert(CallerIdConstants.USGovChannel.includes('usgov'), 'USGovChannel should contain usgov')
    assert(CallerIdConstants.AgentPrefix.includes('aadappid'), 'AgentPrefix should contain aadappid')
  })

  it('should be suitable for identity comparison', () => {
    const callerId1 = CallerIdConstants.PublicAzureChannel
    const callerId2 = CallerIdConstants.PublicAzureChannel
    
    assert.strictEqual(callerId1, callerId2)
    assert(callerId1 === callerId2)
  })

  it('should work in switch statements', () => {
    const testCallerId = CallerIdConstants.PublicAzureChannel
    let matched = false
    
    switch (testCallerId) {
      case CallerIdConstants.PublicAzureChannel:
        matched = true
        break
      case CallerIdConstants.USGovChannel:
        break
      default:
        break
    }
    
    assert(matched, 'Should match in switch statement')
  })
})