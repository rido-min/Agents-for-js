import assert from 'assert'
import { describe, it } from 'node:test'
import { CitationUtil } from '../../../../src/app/streaming/citationUtil'
import { ClientCitation } from '@microsoft/agents-activity'

describe('CitationUtil', () => {
  describe('snippet', () => {
    it('should return original text if within max length', () => {
      const text = 'Short text'
      const result = CitationUtil.snippet(text, 20)
      assert.strictEqual(result, text)
    })

    it('should clip text at word boundary when exceeds max length', () => {
      const text = 'This is a very long sentence that needs to be clipped'
      const result = CitationUtil.snippet(text, 25)
      assert.strictEqual(result, 'This is a very long...')
    })

    it('should handle text with no spaces', () => {
      const text = 'verylongtextwithoutspaces'
      const result = CitationUtil.snippet(text, 10)
      assert.strictEqual(result, '...')
    })

    it('should handle empty text', () => {
      const text = ''
      const result = CitationUtil.snippet(text, 10)
      assert.strictEqual(result, '')
    })

    it('should handle text exactly at max length', () => {
      const text = 'Exactly twenty chars'
      const result = CitationUtil.snippet(text, 20)
      assert.strictEqual(result, text)
    })

    it('should handle single word longer than max length', () => {
      const text = 'supercalifragilisticexpialidocious'
      const result = CitationUtil.snippet(text, 10)
      assert.strictEqual(result, '...')
    })

    it('should handle text with trailing spaces', () => {
      const text = 'Text with trailing spaces   that are very long'
      const result = CitationUtil.snippet(text, 25)
      assert.strictEqual(result, 'Text with trailing...')
    })

    it('should handle text with multiple consecutive spaces', () => {
      const text = 'Text  with   multiple    spaces that is long'
      const result = CitationUtil.snippet(text, 20)
      assert.strictEqual(result, 'Text  with...')
    })

    it('should handle max length of 0', () => {
      const text = 'Any text'
      const result = CitationUtil.snippet(text, 0)
      assert.strictEqual(result, '...')
    })

    it('should handle negative max length', () => {
      const text = 'Any text'
      const result = CitationUtil.snippet(text, -5)
      assert.strictEqual(result, '...')
    })

    it('should handle very large max length', () => {
      const text = 'Short text'
      const result = CitationUtil.snippet(text, 1000)
      assert.strictEqual(result, text)
    })
  })

  describe('formatCitationsResponse', () => {
    it('should convert [doc1] to [1]', () => {
      const text = 'This is a reference [doc1] in the text'
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, 'This is a reference [1] in the text')
    })

    it('should convert [docs2] to [2]', () => {
      const text = 'Multiple documents [docs2] referenced here'
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, 'Multiple documents [2] referenced here')
    })

    it('should handle multiple citations in same text', () => {
      const text = 'Text with [doc1] and [docs2] and [doc3] citations'
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, 'Text with [1] and [2] and [3] citations')
    })

    it('should handle case insensitive matching', () => {
      const text = 'Text with [DOC1] and [Docs2] and [dOc3] citations'
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, 'Text with [1] and [2] and [3] citations')
    })

    it('should handle multi-digit numbers', () => {
      const text = 'Reference [doc123] and [docs456]'
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, 'Reference [123] and [456]')
    })

    it('should not modify text without citations', () => {
      const text = 'Text without any citations'
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, text)
    })

    it('should handle empty text', () => {
      const text = ''
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, '')
    })

    it('should not modify incorrect citation formats', () => {
      const text = 'Text with [document1] and [ref2] that should not change'
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, text)
    })

    it('should handle citations at start and end of text', () => {
      const text = '[doc1] This text has citations at the beginning and end [docs2]'
      const result = CitationUtil.formatCitationsResponse(text)
      assert.strictEqual(result, '[1] This text has citations at the beginning and end [2]')
    })
  })

  describe('getUsedCitations', () => {
    const createCitation = (position: number, content: string): ClientCitation => ({
      position,
      content,
      title: `Citation ${position}`,
      url: `https://example.com/${position}`
    })

    it('should return undefined when no citations found in text', () => {
      const text = 'Text without any citation references'
      const citations = [createCitation(1, 'Content 1'), createCitation(2, 'Content 2')]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert.strictEqual(result, undefined)
    })

    it('should return citations used in text', () => {
      const text = 'This text references [1] and [3] but not two'
      const citations = [
        createCitation(1, 'Content 1'),
        createCitation(2, 'Content 2'),
        createCitation(3, 'Content 3')
      ]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 2)
      assert.strictEqual(result[0].position, 1)
      assert.strictEqual(result[1].position, 3)
    })

    it('should remove duplicate citation references', () => {
      const text = 'This text references [1] multiple times [1] and [1] again'
      const citations = [createCitation(1, 'Content 1')]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0].position, 1)
    })

    it('should handle citations not in the provided list', () => {
      const text = 'This text references [1] and [5] but only [1] exists'
      const citations = [createCitation(1, 'Content 1')]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0].position, 1)
    })

    it('should handle empty citations array', () => {
      const text = 'This text references [1] and [2]'
      const citations: ClientCitation[] = []
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 0)
    })

    it('should handle empty text', () => {
      const text = ''
      const citations = [createCitation(1, 'Content 1')]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert.strictEqual(result, undefined)
    })

    it('should handle multi-digit citation numbers', () => {
      const text = 'This text references [123] and [456]'
      const citations = [
        createCitation(123, 'Content 123'),
        createCitation(456, 'Content 456')
      ]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 2)
      assert.strictEqual(result[0].position, 123)
      assert.strictEqual(result[1].position, 456)
    })

    it('should preserve order of citations as they appear in text', () => {
      const text = 'References [3] then [1] then [2]'
      const citations = [
        createCitation(1, 'Content 1'),
        createCitation(2, 'Content 2'),
        createCitation(3, 'Content 3')
      ]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0].position, 3)
      assert.strictEqual(result[1].position, 1)
      assert.strictEqual(result[2].position, 2)
    })

    it('should handle citations with leading zeros', () => {
      const text = 'This text references [01] and [02]'
      const citations = [
        createCitation(1, 'Content 1'),
        createCitation(2, 'Content 2')
      ]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 0) // Leading zeros won't match positions 1 and 2
    })

    it('should be case sensitive for citation matching', () => {
      const text = 'This text has [1] citation'
      const citations = [createCitation(1, 'Content 1')]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 1)
    })

    it('should handle citations at start and end of text', () => {
      const text = '[1] This text starts and ends with citations [2]'
      const citations = [
        createCitation(1, 'Content 1'),
        createCitation(2, 'Content 2')
      ]
      
      const result = CitationUtil.getUsedCitations(text, citations)
      assert(result)
      assert.strictEqual(result.length, 2)
      assert.strictEqual(result[0].position, 1)
      assert.strictEqual(result[1].position, 2)
    })
  })
})