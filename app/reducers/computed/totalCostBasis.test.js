import assert from 'assert'
import totalCostBasis from './totalCostBasis'

const mockPerformanceData = (trader, yesCostBasis) => {
  return {
    trader,
    decisionId: 0,
    yesCostBasis
  }
}

describe('totalCostBasis', () => {
  describe('when given a trader address and performance array with data for that trader', () => {
    it('should return sum of yesCostBasis for each decision total with that trader address', () => {
      const performanceArray = [
        mockPerformanceData('trader_0', 200),
        mockPerformanceData('trader_1', 100),
        mockPerformanceData('trader_0', 300)
      ]
      assert.equal(totalCostBasis('trader_0', performanceArray), 500)
    })
  })

  describe('when given a trader address and performance array without data for that trader', () => {
    it('should return 0', () => {
      const performanceArray = [
        mockPerformanceData('trader_1', 200),
        mockPerformanceData('trader_1', 100),
        mockPerformanceData('trader_1', 300)
      ]
      assert.equal(totalCostBasis('trader_0', performanceArray), 0)
    })
  })
})
