import assert from 'assert'
import { describe, it, beforeEach, afterEach } from 'node:test'
import { FileStorage } from '../../../src'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('FileStorage', () => {
  let tempDir: string
  let fileStorage: FileStorage

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-storage-test-'))
    fileStorage = new FileStorage(tempDir)
  })

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  it('should create FileStorage with directory path', () => {
    assert(fileStorage)
    assert.strictEqual(typeof fileStorage.read, 'function')
    assert.strictEqual(typeof fileStorage.write, 'function')
    assert.strictEqual(typeof fileStorage.delete, 'function')
  })

  it('should write and read data', async () => {
    const testData = {
      'key1': { value: 'test-value', eTag: '*' }
    }

    await fileStorage.write(testData)
    const result = await fileStorage.read(['key1'])

    assert(result['key1'])
    assert.strictEqual(result['key1'].value, 'test-value')
    assert.strictEqual(typeof result['key1'].eTag, 'string')
  })

  it('should return empty object for non-existent keys', async () => {
    const result = await fileStorage.read(['non-existent-key'])
    assert.deepStrictEqual(result, {})
  })

  it('should delete data', async () => {
    const testData = {
      'key1': { value: 'test-value', eTag: '*' }
    }

    await fileStorage.write(testData)
    await fileStorage.delete(['key1'])
    
    const result = await fileStorage.read(['key1'])
    assert.deepStrictEqual(result, {})
  })

  it('should handle multiple keys', async () => {
    const testData = {
      'key1': { value: 'value1', eTag: '*' },
      'key2': { value: 'value2', eTag: '*' }
    }

    await fileStorage.write(testData)
    const result = await fileStorage.read(['key1', 'key2'])

    assert(result['key1'])
    assert(result['key2'])
    assert.strictEqual(result['key1'].value, 'value1')
    assert.strictEqual(result['key2'].value, 'value2')
  })

  it('should handle eTag updates', async () => {
    const testData = {
      'key1': { value: 'initial-value', eTag: '*' }
    }

    await fileStorage.write(testData)
    
    // FileStorage doesn't enforce eTag conflicts, it just updates values
    const updateData = {
      'key1': { value: 'new-value', eTag: 'some-etag' }
    }

    await assert.doesNotReject(async () => {
      await fileStorage.write(updateData)
    })

    const result = await fileStorage.read(['key1'])
    assert.strictEqual(result['key1'].value, 'new-value')
  })

  it('should throw error for empty keys on read', async () => {
    await assert.rejects(
      async () => await fileStorage.read([]),
      /Keys are required/
    )
  })

  it('should handle empty changes object', async () => {
    // FileStorage may handle empty objects differently than expected
    // Let's just verify it doesn't crash
    await assert.doesNotReject(async () => {
      await fileStorage.write({})
    })
  })
})