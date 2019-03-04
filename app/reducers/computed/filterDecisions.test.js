import assert from 'assert'
import filterDecisions from './filterDecisions'

const mockPerformanceData = (trader, decisionId) => ({ trader, decisionId })
const mockDecisionMarketData = (decisionId, status) => ({ decisionId, status })

const performanceArray = [
  mockPerformanceData('trader_0', 0),
  mockPerformanceData('trader_0', 1),
  mockPerformanceData('trader_0', 2),
  mockPerformanceData('trader_0', 3),
  mockPerformanceData('trader_1', 0)
]

const decisionMarketArray = [
  mockDecisionMarketData(0, 'OPEN'),
  mockDecisionMarketData(1, 'OPEN'),
  mockDecisionMarketData(2, 'OPEN'),
  mockDecisionMarketData(3, 'CLOSED')
]

describe('filterDecisions', () => {
  describe('when given data with matching traders and statuses', () => {
    it('returns the correct decisions', () => {
      const decisions = filterDecisions({
        decisionMarkets: decisionMarketArray,
        performance: performanceArray,
        trader: 'trader_0',
        status: 'OPEN'
      })
      assert.equal(decisions.length, 3)
      assert.deepEqual(decisions[0], mockDecisionMarketData(0, 'OPEN'))
      assert.deepEqual(decisions[1], mockDecisionMarketData(1, 'OPEN'))
      assert.deepEqual(decisions[2], mockDecisionMarketData(2, 'OPEN'))
    })
  })

  describe('when given performance data with no matching statuses', () => {
    it('returns an empty array', () => {
      assert.deepEqual(filterDecisions({
        decisionMarkets: decisionMarketArray,
        performance: performanceArray,
        trader: 'trader_0',
        status: 'RESOLVED'
      }), [])
    })
  })

  describe('when given performance data with no matching traders', () => {
    it('returns an empty array', () => {
      assert.deepEqual(filterDecisions({
        decisionMarkets: decisionMarketArray,
        performance: performanceArray,
        trader: 'trader_5',
        status: 'OPEN'
      }), [])
    })
  })

  describe('when given undefined trader value', () => {
    it('returns decisions for all traders', () => {
      const decisions = filterDecisions({
        decisionMarkets: decisionMarketArray,
        performance: performanceArray,
        status: 'OPEN'
      })
      assert.equal(decisions.length, 3)
      assert.deepEqual(decisions[0], mockDecisionMarketData(0, 'OPEN'))
      assert.deepEqual(decisions[1], mockDecisionMarketData(1, 'OPEN'))
      assert.deepEqual(decisions[2], mockDecisionMarketData(2, 'OPEN'))
    })
  })
})
