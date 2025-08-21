import assert from 'assert'
import { describe, it } from 'node:test'

describe('BlobsStorage', () => {
  it('should export BlobsStorage class', () => {
    const { BlobsStorage } = require('../src')
    assert.strictEqual(typeof BlobsStorage, 'function')
  })

  it('should create BlobsStorage with container name and connection string', () => {
    const { BlobsStorage } = require('../src')
    const blobsStorage = new BlobsStorage('test-container', 'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key==;EndpointSuffix=core.windows.net')
    
    assert(blobsStorage)
    assert.strictEqual(typeof blobsStorage.read, 'function')
    assert.strictEqual(typeof blobsStorage.write, 'function')
    assert.strictEqual(typeof blobsStorage.delete, 'function')
  })

  it('should have Storage interface methods', () => {
    const { BlobsStorage } = require('../src')
    const blobsStorage = new BlobsStorage('test-container', 'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key==;EndpointSuffix=core.windows.net')
    
    // Check that it implements the Storage interface
    assert.strictEqual(typeof blobsStorage.read, 'function')
    assert.strictEqual(typeof blobsStorage.write, 'function')
    assert.strictEqual(typeof blobsStorage.delete, 'function')
  })

  it('should handle options parameter', () => {
    const { BlobsStorage } = require('../src')
    const options = {
      storagePipelineOptions: {
        retryOptions: {
          maxTries: 3
        }
      }
    }
    
    const blobsStorage = new BlobsStorage('test-container', 'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key==;EndpointSuffix=core.windows.net', options)
    assert(blobsStorage)
  })

  it('should handle constructor without options', () => {
    const { BlobsStorage } = require('../src')
    const blobsStorage = new BlobsStorage('test-container', 'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key==;EndpointSuffix=core.windows.net')
    assert(blobsStorage)
  })
})