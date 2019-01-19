import assert from 'assert'
import currentGainLoss from './currentGainLoss'

const mockPerformanceData = (trader, totalGainLoss) => {
  return {
    trader,
    decisionId: 0,
    totalGainLoss
  }
}

describe('currentGainLoss', () => {
  describe('when given a trader address and performance array with data for that trader', () => {
    it('should return sum of totalGainLoss for each decision total with that trader address', () => {
      const performanceArray = [
        mockPerformanceData('trader_0', 200),
        mockPerformanceData('trader_1', 100),
        mockPerformanceData('trader_0', 300)
      ]
      assert.equal(currentGainLoss('trader_0', performanceArray), 500)
    })
  })

  describe('when given a trader address and performance array without data for that trader', () => {
    it('should return 0', () => {
      const performanceArray = [
        mockPerformanceData('trader_1', 200),
        mockPerformanceData('trader_1', 100),
        mockPerformanceData('trader_1', 300)
      ]
      assert.equal(currentGainLoss('trader_0', performanceArray), 0)
    })
  })
})
