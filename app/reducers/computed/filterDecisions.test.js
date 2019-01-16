import assert from 'assert'
import filterDecisions from './filterDecisions'

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

describe('filterDecisions', () => {
  describe('when given data with matching traders and statuses', () => {
    it('returns the correct decisions', () => {
      const decisions = filterDecisions(decisionMarketArray, performanceArray, 'trader_0', 'OPEN')
      assert.equal(decisions.length, 3)
      assert.deepEqual(decisions[0], mockDecisionMarketData(0, 'OPEN'))
      assert.deepEqual(decisions[1], mockDecisionMarketData(1, 'OPEN'))
      assert.deepEqual(decisions[2], mockDecisionMarketData(2, 'OPEN'))
    })
  })

  describe('when given performance data with no matching statuses', () => {
    it('returns an empty array', () => {
      assert.deepEqual(filterDecisions(decisionMarketArray, performanceArray, 'trader_0', 'RESOLVED'), [])
    })
  })

  describe('when given performance data with no matching traders', () => {
    it('returns an empty array', () => {
      assert.deepEqual(filterDecisions(decisionMarketArray, performanceArray, 'trader_5', 'OPEN'), [])
    })
  })
})
