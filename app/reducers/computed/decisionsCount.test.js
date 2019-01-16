import assert from 'assert'
import decisionsCount from './decisionsCount'

const mockPerformanceData = (trader, decisionId) => ({ trader, decisionId })
const mockDecisionMarketData = (id, status) => ({ id, status })

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

describe('decisionsCount', () => {
  describe('when given data with matching traders and statuses', () => {
    it('returns the correct decisions count', () => {
      assert.equal(decisionsCount(decisionMarketArray, performanceArray, 'trader_0', 'OPEN'), 3)
    })
  })

  describe('when given performance data with no matching statuses', () => {
    it('returns 0', () => {
      assert.equal(decisionsCount(decisionMarketArray, performanceArray, 'trader_0', 'RESOLVED'), 0)
    })
  })

  describe('when given performance data with no matching traders', () => {
    it('returns 0', () => {
      assert.equal(decisionsCount(decisionMarketArray, performanceArray, 'trader_5', 'OPEN'), 0)
    })
  })
})
