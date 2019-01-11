import assert from 'assert'
import trades from './trades'

// TODO: check if it's 0=SHORT and 1=LONG
const mockShortTradesAction = {
  type: 'BUY_MARKET_POSITIONS_EVENT',
  returnValues: {
    decisionId: '0',
    tradeTime: '1546469212',
    noCosts: ['400', '100'],
    yesCosts: ['300', '200'],
    noPurchaseAmounts: ['250', '0'],
    yesPurchaseAmounts: ['250', '0'],
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
  })
})
