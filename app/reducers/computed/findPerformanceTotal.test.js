import assert from 'assert'
import findPerformanceTotal from './findPerformanceTotal'

const mockPerformanceTotalData = (decisionId, trader) => ({ decisionId, trader })

const total0 = mockPerformanceTotalData(0, 'mock_trader_0')
const total1 = mockPerformanceTotalData(1, 'mock_trader_1')
const total2 = mockPerformanceTotalData(1, 'mock_trader_2')
const total3 = mockPerformanceTotalData(2, 'mock_trader_2')
const performanceTotals = [ total0, total1, total2 ]

describe('findPerformanceTotal', () => {
  describe('when given performance totals and a decisionId that has a match', () => {
    it('returns the correct performance total', () => {
      assert.deepEqual(findPerformanceTotal(performanceTotals, 1, 'mock_trader_1'), total1)
    })
  })

  describe('when given performanceTotals and a decisionId that does not have a matching id', () => {
    it('returns undefined', () => {
      assert.equal(findPerformanceTotal(performanceTotals, 12, 'mock_trader_1'), undefined)
    })
  })

  describe('when given performanceTotals and a decisionId that does not have a matching trader', () => {
    it('returns undefined', () => {
      assert.equal(findPerformanceTotal(performanceTotals, 1, 'mock_trader_12'), undefined)
    })
  })
})
