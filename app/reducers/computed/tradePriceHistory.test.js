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

const timeIncrement = 10
const currentTime = 45

const mockTrades = [
  // 0 - 10
  // no trades

  // 10 - 20
  mockTrade('0', '11', .5, .6),
  mockTrade('0', '12', .51, .61),
  mockTrade('1', '13', .99, .99),
  mockTrade('0', '14', .52, .62),

  // 20 - 30
  // no trades

  // 30 - 40
  mockTrade('0', '31', .7, .8),
  mockTrade('0', '32', .75, .85),
  mockTrade('1', '33', .99, .99),
  mockTrade('0', '34', .8, .9)

  // 40 - 50
  // no trades

  // 50 - 60
  // no trades
]

const mockNoMatchTrades = [
  mockTrade('1', '99', .99, .99),
  mockTrade('1', '99', .99, .99)
]

const mockDecisions = [
  {
    decisionId: 0,
    lowerBound: '0',
    upperBound: '100',
    startDate: '0',
    decisionResolutionDate: '30',
    priceResolutionDate: '60'
  }
]

const expectedYesHistory = [
  {
    start: 0,
    duration: 10,
    pricePercentage: .5,
    price: 50
  },
  {
    start: 10,
    duration: 10,
    pricePercentage: .51,
    price: 51
  },
  {
    start: 20,
    duration: 10,
    pricePercentage: .51,
    price: 51
  },
  {
    start: 30,
    duration: 10,
    pricePercentage: .75,
    price: 75
  },
  {
    start: 40,
    duration: 10,
    pricePercentage: .75,
    price: 75
  },
  {
    start: 50,
    duration: 10,
    pricePercentage: null,
    price: null
  }
]

const expectedNoHistory = [
  {
    start: 0,
    duration: 10,
    pricePercentage: .5,
    price: 50
  },
  {
    start: 10,
    duration: 10,
    pricePercentage: .61,
    price: 61
  },
  {
    start: 20,
    duration: 10,
    pricePercentage: .61,
    price: 61
  },
  {
    start: 30,
    duration: 10,
    pricePercentage: .85,
    price: 85
  },
  {
    start: 40,
    duration: 10,
    pricePercentage: .85,
    price: 85
  },
  {
    start: 50,
    duration: 10,
    pricePercentage: null,
    price: null
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
        increment: timeIncrement,
        now: currentTime
      })
    })
    
    it('should assume .5 starting point if there are no trades for the first time increment', () => {
      assert.deepEqual(hist.yesHistory[0], expectedYesHistory[0])
      assert.deepEqual(hist.noHistory[0], expectedNoHistory[0])
    })
    
    it('should return the average of trades within the time increment', () => {
      assert.deepEqual(hist.yesHistory[1], expectedYesHistory[1])
      assert.deepEqual(hist.yesHistory[3], expectedYesHistory[3])
      assert.deepEqual(hist.noHistory[1], expectedNoHistory[1])
      assert.deepEqual(hist.noHistory[3], expectedNoHistory[3])
    })
    
    it('should use the average from the previous increment for increments with no trades', () => {
      assert.deepEqual(hist.yesHistory[2], expectedYesHistory[2])
      assert.deepEqual(hist.yesHistory[4], expectedYesHistory[4])
      assert.deepEqual(hist.noHistory[2], expectedNoHistory[2])
      assert.deepEqual(hist.noHistory[4], expectedNoHistory[4])
    })
    
    it('should set null price values for increments after the current time', () => {
      assert.deepEqual(hist.yesHistory[5], expectedYesHistory[5])
      assert.deepEqual(hist.noHistory[5], expectedNoHistory[5])
    })

    it('should not create an increment after priceResolutionDate', () => {
      assert.equal(hist.yesHistory[6], undefined)
      assert.equal(hist.noHistory[6], undefined)
    })

  })

  describe('when given an array with no matching trades', () => {
    let hist
    beforeEach(() => {
      hist = tradePriceHistory({
        decisionId: 0,
        decisions: mockDecisions,
        trades: mockNoMatchTrades,
        increment: timeIncrement,
        now: currentTime
      })
    })

    it('should return empty arrays for YES-LONG prices', () => {
      assert.deepEqual(hist.yesHistory, [])
    })

    it('should return empty arrays for NO-LONG prices', () => {
      assert.deepEqual(hist.noHistory, [])
    })
  })
})