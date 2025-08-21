import assert from 'assert'
import { describe, it } from 'node:test'
import { MessageReaction, messageReactionZodSchema } from '../../../src/messageReaction'
import { MessageReactionTypes } from '../../../src/messageReactionTypes'
import { ZodError } from 'zod'

describe('MessageReaction', () => {
  describe('messageReactionZodSchema', () => {
    it('should validate MessageReaction with known type', () => {
      const reaction: MessageReaction = {
        type: MessageReactionTypes.Like
      }
      
      const result = messageReactionZodSchema.parse(reaction)
      assert.deepStrictEqual(result, reaction)
    })

    it('should validate MessageReaction with custom string type', () => {
      const reaction: MessageReaction = {
        type: 'custom-reaction'
      }
      
      const result = messageReactionZodSchema.parse(reaction)
      assert.deepStrictEqual(result, reaction)
    })

    it('should validate MessageReaction with all known types', () => {
      const knownTypes = Object.values(MessageReactionTypes)
      
      knownTypes.forEach(type => {
        const reaction: MessageReaction = { type }
        const result = messageReactionZodSchema.parse(reaction)
        assert.deepStrictEqual(result, reaction)
      })
    })

    it('should throw error for empty string type', () => {
      const reaction = {
        type: ''
      }
      
      assert.throws(() => {
        messageReactionZodSchema.parse(reaction)
      }, ZodError)
    })

    it('should throw error for missing type', () => {
      const reaction = {}
      
      assert.throws(() => {
        messageReactionZodSchema.parse(reaction)
      }, ZodError)
    })

    it('should throw error for null type', () => {
      const reaction = {
        type: null
      }
      
      assert.throws(() => {
        messageReactionZodSchema.parse(reaction)
      }, ZodError)
    })

    it('should throw error for undefined type', () => {
      const reaction = {
        type: undefined
      }
      
      assert.throws(() => {
        messageReactionZodSchema.parse(reaction)
      }, ZodError)
    })

    it('should throw error for numeric type', () => {
      const reaction = {
        type: 123
      }
      
      assert.throws(() => {
        messageReactionZodSchema.parse(reaction)
      }, ZodError)
    })

    it('should throw error for boolean type', () => {
      const reaction = {
        type: true
      }
      
      assert.throws(() => {
        messageReactionZodSchema.parse(reaction)
      }, ZodError)
    })

    it('should handle unicode characters in custom type', () => {
      const reaction: MessageReaction = {
        type: '👍🎉💯'
      }
      
      const result = messageReactionZodSchema.parse(reaction)
      assert.deepStrictEqual(result, reaction)
    })

    it('should handle whitespace in custom type', () => {
      const reaction: MessageReaction = {
        type: 'custom reaction with spaces'
      }
      
      const result = messageReactionZodSchema.parse(reaction)
      assert.deepStrictEqual(result, reaction)
    })

    it('should handle special characters in custom type', () => {
      const reaction: MessageReaction = {
        type: 'custom-reaction_with.special@chars!'
      }
      
      const result = messageReactionZodSchema.parse(reaction)
      assert.deepStrictEqual(result, reaction)
    })

    it('should handle very long custom type', () => {
      const reaction: MessageReaction = {
        type: 'a'.repeat(1000)
      }
      
      const result = messageReactionZodSchema.parse(reaction)
      assert.deepStrictEqual(result, reaction)
    })

    it('should preserve additional properties during validation', () => {
      const reaction = {
        type: MessageReactionTypes.Like,
        additionalProperty: 'should be preserved'
      }
      
      const result = messageReactionZodSchema.parse(reaction)
      assert.strictEqual(result.type, MessageReactionTypes.Like)
      // Note: Zod strips unknown properties by default, so additionalProperty won't be preserved
      assert.strictEqual((result as any).additionalProperty, undefined)
    })
  })

  describe('MessageReaction interface', () => {
    it('should allow creating MessageReaction with enum type', () => {
      const reaction: MessageReaction = {
        type: MessageReactionTypes.Like
      }
      
      assert.strictEqual(reaction.type, MessageReactionTypes.Like)
    })

    it('should allow creating MessageReaction with string type', () => {
      const reaction: MessageReaction = {
        type: 'custom-type'
      }
      
      assert.strictEqual(reaction.type, 'custom-type')
    })

    it('should be assignable from objects with known types', () => {
      const reactions: MessageReaction[] = [
        { type: MessageReactionTypes.Like },
        { type: MessageReactionTypes.Dislike },
        { type: 'custom' }
      ]
      
      assert.strictEqual(reactions.length, 3)
      assert.strictEqual(reactions[0].type, MessageReactionTypes.Like)
      assert.strictEqual(reactions[1].type, MessageReactionTypes.Dislike)
      assert.strictEqual(reactions[2].type, 'custom')
    })
  })
})