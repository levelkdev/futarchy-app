import assert from 'assert'
import trades from './trades'

// TODO: check if it's 0=SHORT and 1=LONG
const mockShortTradesAction = {
  type: 'DEBUG_TRADE_EVENT',
  returnValues: {
    decisionId: '0',
    tradeTime: '1546469212',
    netNoCost: '500',
    netYesCost: '500',
    noShortTokenAmount: '250',
    noLongTokenAmount: '0',
    yesShortTokenAmount: '250',
    yesLongTokenAmount: '0',
    tokenAmount: '550',
    trader: 'mock_trader_addr'
  }
}

const mockLongTradesAction = {
  type: 'DEBUG_TRADE_EVENT',
  returnValues: {
    decisionId: '0',
    tradeTime: '1546469212',
    netNoCost: '500',
    netYesCost: '500',
    noShortTokenAmount: '0',
    noLongTokenAmount: '250',
    yesShortTokenAmount: '0',
    yesLongTokenAmount: '250',
    tokenAmount: '550',
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
  })
})
