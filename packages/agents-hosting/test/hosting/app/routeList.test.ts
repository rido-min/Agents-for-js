import assert from 'assert'
import { describe, it, beforeEach } from 'node:test'
import sinon from 'sinon'
import { RouteList } from '../../../src/app/routeList'
import { TurnState } from '../../../src/app/turnState'
import { RouteRank } from '../../../src/app/routeRank'
import { RouteSelector } from '../../../src/app/routeSelector'
import { RouteHandler } from '../../../src/app/routeHandler'

describe('RouteList', () => {
  let routeList: RouteList<TurnState>
  let mockSelector: sinon.SinonStub
  let mockHandler: sinon.SinonStub

  beforeEach(() => {
    routeList = new RouteList<TurnState>()
    mockSelector = sinon.stub().returns(true)
    mockHandler = sinon.stub().resolves()
  })

  describe('addRoute', () => {
    it('should add a basic route with default parameters', () => {
      const result = routeList.addRoute(mockSelector, mockHandler)
      
      assert.strictEqual(result, routeList) // Should return this for chaining
      
      // Verify route was added by iterating
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 1)
      
      const route = routes[0]
      assert.strictEqual(route.selector, mockSelector)
      assert.strictEqual(route.handler, mockHandler)
      assert.strictEqual(route.isInvokeRoute, false)
      assert.strictEqual(route.rank, RouteRank.Unspecified)
      assert.deepStrictEqual(route.authHandlers, [])
    })

    it('should add route with all parameters specified', () => {
      const authHandlers = ['auth1', 'auth2']
      
      routeList.addRoute(mockSelector, mockHandler, true, RouteRank.Highest, authHandlers)
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 1)
      
      const route = routes[0]
      assert.strictEqual(route.selector, mockSelector)
      assert.strictEqual(route.handler, mockHandler)
      assert.strictEqual(route.isInvokeRoute, true)
      assert.strictEqual(route.rank, RouteRank.Highest)
      assert.deepStrictEqual(route.authHandlers, authHandlers)
    })

    it('should sort invoke routes before non-invoke routes', () => {
      const regularSelector = sinon.stub()
      const regularHandler = sinon.stub()
      const invokeSelector = sinon.stub()
      const invokeHandler = sinon.stub()
      
      // Add regular route first
      routeList.addRoute(regularSelector, regularHandler, false, RouteRank.Unspecified)
      
      // Add invoke route second (should be sorted to first position)
      routeList.addRoute(invokeSelector, invokeHandler, true, RouteRank.Unspecified)
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 2)
      
      // Invoke route should be first
      assert.strictEqual(routes[0].selector, invokeSelector)
      assert.strictEqual(routes[0].isInvokeRoute, true)
      
      // Regular route should be second
      assert.strictEqual(routes[1].selector, regularSelector)
      assert.strictEqual(routes[1].isInvokeRoute, false)
    })

    it('should sort routes by rank in ascending order', () => {
      const selector1 = sinon.stub()
      const handler1 = sinon.stub()
      const selector2 = sinon.stub()
      const handler2 = sinon.stub()
      const selector3 = sinon.stub()
      const handler3 = sinon.stub()
      
      // Add routes with different ranks (out of order)
      routeList.addRoute(selector1, handler1, false, RouteRank.Unspecified)
      routeList.addRoute(selector2, handler2, false, RouteRank.First)
      routeList.addRoute(selector3, handler3, false, RouteRank.Last)
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 3)
      
      // Should be sorted by rank: Highest (-100), Normal (0), Lowest (100)
      assert.strictEqual(routes[0].rank, RouteRank.Highest)
      assert.strictEqual(routes[1].rank, RouteRank.Normal)
      assert.strictEqual(routes[2].rank, RouteRank.Lowest)
    })

    it('should prioritize invoke routes over rank', () => {
      const regularSelector = sinon.stub()
      const regularHandler = sinon.stub()
      const invokeSelector = sinon.stub()
      const invokeHandler = sinon.stub()
      
      // Add regular route with highest rank
      routeList.addRoute(regularSelector, regularHandler, false, RouteRank.First)
      
      // Add invoke route with lowest rank (should still come first)
      routeList.addRoute(invokeSelector, invokeHandler, true, RouteRank.Last)
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 2)
      
      // Invoke route should be first despite having lower rank
      assert.strictEqual(routes[0].isInvokeRoute, true)
      assert.strictEqual(routes[0].rank, RouteRank.Last)
      
      // Regular route should be second despite having higher rank
      assert.strictEqual(routes[1].isInvokeRoute, false)
      assert.strictEqual(routes[1].rank, RouteRank.First)
    })

    it('should sort invoke routes by rank among themselves', () => {
      const selector1 = sinon.stub()
      const handler1 = sinon.stub()
      const selector2 = sinon.stub()
      const handler2 = sinon.stub()
      
      // Add two invoke routes with different ranks
      routeList.addRoute(selector1, handler1, true, RouteRank.Unspecified)
      routeList.addRoute(selector2, handler2, true, RouteRank.First)
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 2)
      
      // Both are invoke routes, so rank determines order
      assert.strictEqual(routes[0].rank, RouteRank.First)
      assert.strictEqual(routes[1].rank, RouteRank.Unspecified)
    })

    it('should handle undefined rank as 0 in sorting', () => {
      const selector1 = sinon.stub()
      const handler1 = sinon.stub()
      const selector2 = sinon.stub()
      const handler2 = sinon.stub()
      
      routeList.addRoute(selector1, handler1, false, RouteRank.Unspecified) // MAX_VALUE/2
      routeList.addRoute(selector2, handler2, false, undefined as any) // Should be treated as 0
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 2)
      
      // Both should have effective rank of MAX_VALUE/2 and 0, so 0 should come first
      assert.strictEqual(routes[0].rank, undefined)
      assert.strictEqual(routes[1].rank, RouteRank.Unspecified)
    })

    it('should allow method chaining', () => {
      const selector1 = sinon.stub()
      const handler1 = sinon.stub()
      const selector2 = sinon.stub()
      const handler2 = sinon.stub()
      
      const result = routeList
        .addRoute(selector1, handler1)
        .addRoute(selector2, handler2)
      
      assert.strictEqual(result, routeList)
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 2)
    })

    it('should handle empty auth handlers array', () => {
      routeList.addRoute(mockSelector, mockHandler, false, RouteRank.Normal, [])
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 1)
      assert.deepStrictEqual(routes[0].authHandlers, [])
    })

    it('should preserve auth handlers array reference', () => {
      const authHandlers = ['auth1', 'auth2']
      
      routeList.addRoute(mockSelector, mockHandler, false, RouteRank.Normal, authHandlers)
      
      const routes = Array.from(routeList)
      assert.strictEqual(routes[0].authHandlers, authHandlers)
    })
  })

  describe('iterator', () => {
    it('should be iterable with for...of', () => {
      const selector1 = sinon.stub()
      const handler1 = sinon.stub()
      const selector2 = sinon.stub()
      const handler2 = sinon.stub()
      
      routeList.addRoute(selector1, handler1)
      routeList.addRoute(selector2, handler2)
      
      const routes = []
      for (const route of routeList) {
        routes.push(route)
      }
      
      assert.strictEqual(routes.length, 2)
      assert.strictEqual(routes[0].selector, selector1)
      assert.strictEqual(routes[1].selector, selector2)
    })

    it('should be iterable with Array.from', () => {
      const selector1 = sinon.stub()
      const handler1 = sinon.stub()
      
      routeList.addRoute(selector1, handler1)
      
      const routes = Array.from(routeList)
      
      assert.strictEqual(routes.length, 1)
      assert.strictEqual(routes[0].selector, selector1)
      assert.strictEqual(routes[0].handler, handler1)
    })

    it('should return empty iterator when no routes added', () => {
      const routes = Array.from(routeList)
      assert.strictEqual(routes.length, 0)
    })

    it('should reflect current sorted state', () => {
      const regularSelector = sinon.stub()
      const regularHandler = sinon.stub()
      const invokeSelector = sinon.stub()
      const invokeHandler = sinon.stub()
      
      // Add regular route first
      routeList.addRoute(regularSelector, regularHandler, false)
      
      // Verify initial state
      let routes = Array.from(routeList)
      assert.strictEqual(routes.length, 1)
      assert.strictEqual(routes[0].isInvokeRoute, false)
      
      // Add invoke route (should reorder)
      routeList.addRoute(invokeSelector, invokeHandler, true)
      
      // Verify new sorted state
      routes = Array.from(routeList)
      assert.strictEqual(routes.length, 2)
      assert.strictEqual(routes[0].isInvokeRoute, true) // Invoke route should be first now
      assert.strictEqual(routes[1].isInvokeRoute, false)
    })
  })
})