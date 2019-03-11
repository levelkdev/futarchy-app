import assert from 'assert'
import tradePriceHistory from './tradePriceHistory'

const mockTrade = (
  decisionId,
  tradeTime,
  yesLongMarginalPrice,
  noLongMarginalPrice
) => ({
  decisionId,
  tradeTime,
  yesLongMarginalPrice,
  noLongMarginalPrice
})

const hourIncrement = 3600

const mockTrades = [
  // hour 1
  mockTrade('0', '1500000000', .5, .6),
  mockTrade('0', '1500000001', .51, .61),
  mockTrade('1', '1500000002', .99, .99),
  mockTrade('0', '1500000002', .52, .62),
  // hour 2
  mockTrade('0', '1500003601', .7, .8),
  mockTrade('0', '1500003602', .75, .85),
  mockTrade('1', '1500003603', .99, .99),
  mockTrade('0', '1500003604', .8, .9)
]

const mockNoMatchTrades = [
  mockTrade('1', '1500000002', .99, .99),
  mockTrade('1', '1500003603', .99, .99)
]

const mockDecisions = [
  {
    decisionId: 0,
    lowerBound: '0',
    upperBound: '100'
  }
]

const currentTime = 1500010000

const expectedYesHistory = [
  {
    timeRange: {
      lower: 1500000000,
      upper: 1500003599
    },
    pricePercentage: .51,
    price: 51
  },
  {
    timeRange: {
      lower: 1500003600,
      upper: 1500007199
    },
    pricePercentage: .75,
    price: 75
  },
  {
    timeRange: {
      lower: 1500007200,
      upper: 1500010000
    },
    pricePercentage: .75,
    price: 75
  }
]

const expectedNoHistory = [
  {
    timeRange: {
      lower: 1500000000,
      upper: 1500003599
    },
    pricePercentage: .61,
    price: 61
  },
  {
    timeRange: {
      lower: 1500003600,
      upper: 1500007199
    },
    pricePercentage: .85,
    price: 85
  },
  {
    timeRange: {
      lower: 1500007200,
      upper: 1500010000
    },
    pricePercentage: .85,
    price: 85
  }
]

describe('tradePriceHistory', () => {
  describe('when given trade prices over a range of times', () => {
    let hist
    beforeEach(() => {
      hist = tradePriceHistory({
        decisionId: 0,
        decisions: mockDecisions,
        trades: mockTrades,
        increment: hourIncrement,
        now: currentTime
      })
    })

    it('should return average prices over the given time increment for YES-LONG prices', () => {
      assert.deepEqual(hist.yesHistory, expectedYesHistory)
    })

    it('should return average prices over the given time increment for NO-LONG prices', () => {
      assert.deepEqual(hist.noHistory, expectedNoHistory)
    })

    it('should return the trade time range', () => {
      assert.equal(hist.timeRange.lower, 1500000000)
      assert.equal(hist.timeRange.upper, currentTime)
    })
  })

  describe('when given an array with no matching trades', () => {
    let hist
    beforeEach(() => {
      hist = tradePriceHistory({
        decisionId: 0,
        decisions: mockDecisions,
        trades: mockNoMatchTrades,
        increment: hourIncrement,
        now: currentTime
      })
    })

    it('should return empty arrays for YES-LONG prices', () => {
      assert.deepEqual(hist.yesHistory, [])
    })

    it('should return empty arrays for NO-LONG prices', () => {
      assert.deepEqual(hist.noHistory, [])
    })

    it('should return null values for time ranges', () => {
      assert.equal(hist.timeRange.lower, null)
      assert.equal(hist.timeRange.upper, null)
    })
  })
})