import assert from 'assert'
import trades from './trades'

const ONE = 0x10000000000000000
const SEVENTY_FIVE_PERCENT = (ONE * 0.75) + ''
const FIFTY_PERCENT = (ONE * 0.50) + ''

const mockShortTradesAction = {
  type: 'BUY_MARKET_POSITIONS_EVENT',
  returnValues: {
    decisionId: '0',
    tradeTime: '1546469212',
    noCosts: ['400', '100'],
    yesCosts: ['300', '200'],
    noPurchaseAmounts: ['250', '0'],
    yesPurchaseAmounts: ['250', '0'],
    marginalPrices: ['0', SEVENTY_FIVE_PERCENT, '0', FIFTY_PERCENT],
    collateralAmount: '550',
    trader: 'mock_trader_addr'
  }
}

const mockLongTradesAction = {
  type: 'BUY_MARKET_POSITIONS_EVENT',
  returnValues: {
    decisionId: '0',
    tradeTime: '1546469212',
    noCosts: ['400', '100'],
    yesCosts: ['300', '200'],
    noPurchaseAmounts: ['0', '250'],
    yesPurchaseAmounts: ['0', '250'],
    marginalPrices: ['0', SEVENTY_FIVE_PERCENT, '0', FIFTY_PERCENT],
    collateralAmount: '550',
    trader: 'mock_trader_addr'
  }
}

describe('trades', () => {
  [
    {
      when: 'when given a set of SHORT outcome token trades',
      should: 'should return state with YES-SHORT and NO-SHORT',
      state: undefined,
      action: mockShortTradesAction,
      expectedProps: {
        noTokenName: 'NO-SHORT',
        yesTokenName: 'YES-SHORT'
      }
    },
    {
      when: 'when given a set of LONG outcome token trades',
      should: 'should return state with YES-LONG and NO-LONG',
      state: undefined,
      action: mockLongTradesAction,
      expectedProps: {
        noTokenName: 'NO-LONG',
        yesTokenName: 'YES-LONG'
      }
    },
    {
      when: 'when given token amounts and costs',
      should: 'should return state with correctly calculated noTokenPrice and yesTokenPrice',
      state: undefined,
      action: mockShortTradesAction,
      expectedProps: {
        noTokenPrice: 2,
        yesTokenPrice: 2
      }
    },
    {
      when: 'when given token amounts and costs',
      should: 'should return state with correctly calculated netYesCost and netNoCost',
      state: undefined,
      action: mockShortTradesAction,
      expectedProps: {
        netYesCost: 500,
        netNoCost: 500
      }
    },
    {
      when: 'when given marginal prices',
      should: 'should return state with marginal prices based on 1',
      state: undefined,
      action: mockShortTradesAction,
      expectedProps: {
        yesLongMarginalPrice: 0.75,
        noLongMarginalPrice: 0.5
      }
    }
  ].forEach(({ when, should, state, action, expectedProps }) => {
    describe(when, () => {
      it(should, () => {
        for (var propName in expectedProps) {
          const expectedPropVal = expectedProps[propName]
          assert.equal(trades(state, action)[0][propName], expectedPropVal)
        }
      })
    })
  })

  describe('when trades exist in state', () => {
    it('should return state with new trades appended', () => {
      assert.equal(trades(['mock_trade'], mockLongTradesAction).length, 2)
    })

    it('should set incremental tradeId on new trades', () => {
      assert.equal(trades(['mock_trade'], mockLongTradesAction)[1].tradeId, 1)
    })

    it('should sort trades by tradeTime from oldest to newest', () => {
      const initialState = [
        {
          decisionId: '0',
          tradeTime: '1546469213'
        }
      ]
      const newState = trades(initialState, mockLongTradesAction)
      assert.equal(newState[0].tradeTime, '1546469212')
      assert.equal(newState[1].tradeTime, '1546469213')
    })
  })
})
