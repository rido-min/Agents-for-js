import assert from 'assert'
import { describe, it, beforeEach } from 'node:test'
import { ClaimsIdentity, Claim } from '../../src/claimsIdentity'

describe('ClaimsIdentity', () => {
  let claims: Claim[]

  beforeEach(() => {
    claims = [
      { type: 'sub', value: 'user123' },
      { type: 'name', value: 'John Doe' },
      { type: 'email', value: 'john.doe@example.com' },
      { type: 'role', value: 'admin' }
    ]
  })

  describe('constructor', () => {
    it('should create ClaimsIdentity with claims array', () => {
      const identity = new ClaimsIdentity(claims)
      
      assert.deepStrictEqual(identity.claims, claims)
    })

    it('should create ClaimsIdentity with empty claims array', () => {
      const identity = new ClaimsIdentity([])
      
      assert.deepStrictEqual(identity.claims, [])
    })

    it('should create ClaimsIdentity with string authentication type', () => {
      const authType = 'Bearer'
      const identity = new ClaimsIdentity(claims, authType)
      
      assert.deepStrictEqual(identity.claims, claims)
    })

    it('should create ClaimsIdentity with boolean authentication type', () => {
      const identity = new ClaimsIdentity(claims, true)
      
      assert.deepStrictEqual(identity.claims, claims)
    })

    it('should create ClaimsIdentity with no authentication type', () => {
      const identity = new ClaimsIdentity(claims)
      
      assert.deepStrictEqual(identity.claims, claims)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when authenticationType is true', () => {
      const identity = new ClaimsIdentity(claims, true)
      
      assert.strictEqual(identity.isAuthenticated, true)
    })

    it('should return false when authenticationType is false', () => {
      const identity = new ClaimsIdentity(claims, false)
      
      assert.strictEqual(identity.isAuthenticated, false)
    })

    it('should return true when authenticationType is a non-empty string', () => {
      const identity = new ClaimsIdentity(claims, 'Bearer')
      
      assert.strictEqual(identity.isAuthenticated, true)
    })

    it('should return true when authenticationType is an empty string', () => {
      const identity = new ClaimsIdentity(claims, '')
      
      assert.strictEqual(identity.isAuthenticated, true)
    })

    it('should return false when authenticationType is null', () => {
      const identity = new ClaimsIdentity(claims, null as any)
      
      assert.strictEqual(identity.isAuthenticated, false)
    })

    it('should return false when authenticationType is undefined', () => {
      const identity = new ClaimsIdentity(claims, undefined)
      
      assert.strictEqual(identity.isAuthenticated, false)
    })

    it('should return false when no authenticationType is provided', () => {
      const identity = new ClaimsIdentity(claims)
      
      assert.strictEqual(identity.isAuthenticated, false)
    })
  })

  describe('getClaimValue', () => {
    let identity: ClaimsIdentity

    beforeEach(() => {
      identity = new ClaimsIdentity(claims, 'Bearer')
    })

    it('should return claim value when claim type exists', () => {
      const value = identity.getClaimValue('sub')
      
      assert.strictEqual(value, 'user123')
    })

    it('should return correct value for different claim types', () => {
      assert.strictEqual(identity.getClaimValue('name'), 'John Doe')
      assert.strictEqual(identity.getClaimValue('email'), 'john.doe@example.com')
      assert.strictEqual(identity.getClaimValue('role'), 'admin')
    })

    it('should return null when claim type does not exist', () => {
      const value = identity.getClaimValue('nonexistent')
      
      assert.strictEqual(value, null)
    })

    it('should return null for empty string claim type when not present', () => {
      const value = identity.getClaimValue('')
      
      assert.strictEqual(value, null)
    })

    it('should handle duplicate claim types by returning first match', () => {
      const duplicateClaims = [
        { type: 'role', value: 'admin' },
        { type: 'role', value: 'user' },
        { type: 'name', value: 'John' }
      ]
      const identity = new ClaimsIdentity(duplicateClaims)
      
      const value = identity.getClaimValue('role')
      
      assert.strictEqual(value, 'admin')
    })

    it('should handle claims with empty string values', () => {
      const claimsWithEmpty = [
        { type: 'empty', value: '' },
        { type: 'normal', value: 'value' }
      ]
      const identity = new ClaimsIdentity(claimsWithEmpty)
      
      assert.strictEqual(identity.getClaimValue('empty'), '')
      assert.strictEqual(identity.getClaimValue('normal'), 'value')
    })

    it('should be case sensitive for claim types', () => {
      const value1 = identity.getClaimValue('Sub')
      const value2 = identity.getClaimValue('SUB')
      const value3 = identity.getClaimValue('sub')
      
      assert.strictEqual(value1, null)
      assert.strictEqual(value2, null)
      assert.strictEqual(value3, 'user123')
    })

    it('should work with empty claims array', () => {
      const emptyIdentity = new ClaimsIdentity([])
      
      const value = emptyIdentity.getClaimValue('any')
      
      assert.strictEqual(value, null)
    })

    it('should handle null/undefined claim type gracefully', () => {
      const value1 = identity.getClaimValue(null as any)
      const value2 = identity.getClaimValue(undefined as any)
      
      assert.strictEqual(value1, null)
      assert.strictEqual(value2, null)
    })
  })

  describe('edge cases', () => {
    it('should handle claims with special characters in types and values', () => {
      const specialClaims = [
        { type: 'urn:microsoft:credentials:type', value: 'special-value' },
        { type: 'claim/with/slashes', value: 'value with spaces' },
        { type: 'claim-with-dashes', value: 'value@with#symbols' }
      ]
      const identity = new ClaimsIdentity(specialClaims)
      
      assert.strictEqual(identity.getClaimValue('urn:microsoft:credentials:type'), 'special-value')
      assert.strictEqual(identity.getClaimValue('claim/with/slashes'), 'value with spaces')
      assert.strictEqual(identity.getClaimValue('claim-with-dashes'), 'value@with#symbols')
    })

    it('should expose claims array as readonly reference', () => {
      const originalClaims = [...claims]
      const identity = new ClaimsIdentity(claims)
      
      // The claims property refers to the same array
      assert.strictEqual(identity.claims, claims)
      
      // If we modify the original array, it affects the identity
      claims.push({ type: 'new', value: 'claim' })
      
      // Identity should have the new claim since it's the same reference
      assert.strictEqual(identity.claims.length, originalClaims.length + 1)
      assert.strictEqual(identity.getClaimValue('new'), 'claim')
      
      // Restore original state
      claims.pop()
    })

    it('should work with very large number of claims', () => {
      const largeClaims: Claim[] = []
      for (let i = 0; i < 1000; i++) {
        largeClaims.push({ type: `claim${i}`, value: `value${i}` })
      }
      
      const identity = new ClaimsIdentity(largeClaims)
      
      assert.strictEqual(identity.getClaimValue('claim0'), 'value0')
      assert.strictEqual(identity.getClaimValue('claim999'), 'value999')
      assert.strictEqual(identity.getClaimValue('claim1000'), null)
    })

    it('should handle Unicode characters in claim types and values', () => {
      const unicodeClaims = [
        { type: '用户名', value: '张三' },
        { type: 'émäil', value: 'tëst@exämple.com' },
        { type: '🔑', value: '🎯' }
      ]
      const identity = new ClaimsIdentity(unicodeClaims)
      
      assert.strictEqual(identity.getClaimValue('用户名'), '张三')
      assert.strictEqual(identity.getClaimValue('émäil'), 'tëst@exämple.com')
      assert.strictEqual(identity.getClaimValue('🔑'), '🎯')
    })
  })
})