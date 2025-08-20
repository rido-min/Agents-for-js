import assert from 'assert'
import { describe, it } from 'node:test'

describe('DoOnce', () => {
  it('should execute function once for a given key', async () => {
    const { DoOnce } = require('../src')
    const doOnce = new DoOnce<string>()
    
    let callCount = 0
    const testFn = () => {
      callCount++
      return Promise.resolve('result')
    }

    const result1 = await doOnce.waitFor('key1', testFn)
    const result2 = await doOnce.waitFor('key1', testFn)

    assert.strictEqual(callCount, 1)
    assert.strictEqual(result1, 'result')
    assert.strictEqual(result2, 'result')
  })

  it('should execute function separately for different keys', async () => {
    const { DoOnce } = require('../src')
    const doOnce = new DoOnce<string>()
    
    let callCount = 0
    const testFn = () => {
      callCount++
      return Promise.resolve(`result-${callCount}`)
    }

    const result1 = await doOnce.waitFor('key1', testFn)
    const result2 = await doOnce.waitFor('key2', testFn)

    assert.strictEqual(callCount, 2)
    assert.strictEqual(result1, 'result-1')
    assert.strictEqual(result2, 'result-2')
  })
})

describe('CosmosDbPartitionedStorage', () => {
  it('should export CosmosDbPartitionedStorage class', () => {
    const { CosmosDbPartitionedStorage } = require('../src')
    assert.strictEqual(typeof CosmosDbPartitionedStorage, 'function')
  })

  it('should export basic module structure', () => {
    const src = require('../src')
    
    // Test that the module exports expected classes
    assert.strictEqual(typeof src.CosmosDbPartitionedStorage, 'function')
    assert.strictEqual(typeof src.DoOnce, 'function')
  })
})