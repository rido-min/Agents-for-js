import assert from 'assert'
import { describe, it } from 'node:test'
import { getProductInfo } from '../../src/getProductInfo'
import os from 'os'

describe('getProductInfo', () => {
  it('should return a string containing SDK version', () => {
    const productInfo = getProductInfo()
    
    assert(typeof productInfo === 'string')
    assert(productInfo.includes('agents-sdk-js/'))
  })

  it('should contain Node.js version information', () => {
    const productInfo = getProductInfo()
    
    assert(productInfo.includes('nodejs/'))
    assert(productInfo.includes(process.version))
  })

  it('should contain platform information', () => {
    const productInfo = getProductInfo()
    
    assert(productInfo.includes(os.platform()))
    assert(productInfo.includes(os.arch()))
  })

  it('should contain OS release information', () => {
    const productInfo = getProductInfo()
    
    assert(productInfo.includes(os.release()))
  })

  it('should match expected format pattern', () => {
    const productInfo = getProductInfo()
    
    // Should match: agents-sdk-js/x.x.x nodejs/vx.x.x platform-arch/release
    const pattern = /^agents-sdk-js\/[\d.]+\s+nodejs\/v[\d.]+\s+\w+-\w+\/.*$/
    assert(pattern.test(productInfo))
  })

  it('should be consistent across multiple calls', () => {
    const info1 = getProductInfo()
    const info2 = getProductInfo()
    
    assert.strictEqual(info1, info2)
  })

  it('should not contain undefined or null values', () => {
    const productInfo = getProductInfo()
    
    assert(!productInfo.includes('undefined'))
    assert(!productInfo.includes('null'))
  })

  it('should contain valid version format', () => {
    const productInfo = getProductInfo()
    
    // Extract the version part and verify it looks like a version
    const versionMatch = productInfo.match(/agents-sdk-js\/([\d.]+)/)
    assert(versionMatch)
    
    const version = versionMatch[1]
    assert(version.split('.').length >= 2) // At least major.minor
  })

  it('should contain platform-arch combination with hyphen', () => {
    const productInfo = getProductInfo()
    
    const platformArch = `${os.platform()}-${os.arch()}`
    assert(productInfo.includes(platformArch))
  })

  it('should have all parts separated by spaces', () => {
    const productInfo = getProductInfo()
    
    const parts = productInfo.split(' ')
    assert(parts.length >= 3) // SDK version, nodejs version, and platform info
    
    // Verify each part has expected prefixes
    assert(parts[0].startsWith('agents-sdk-js/'))
    assert(parts[1].startsWith('nodejs/'))
    assert(parts[2].includes('-')) // platform-arch/release format
  })
})