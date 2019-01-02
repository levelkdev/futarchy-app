import assert from 'assert'
import trades from './trades'

// TODO: check if it's 0=SHORT and 1=LONG
const mockShortTradesAction = {
  type: 'DEBUG_TRADE_EVENT',
  returnValues: {
    decisionId: '0',
    netNoCost: '100',
    netYesCost: '100',
    noShortTokenAmount: '250',
    noLongTokenAmount: '0',
    yesShortTokenAmount: '250',
    yesLongTokenAmount: '0',
    tokenAmount: '102',
    trader: 'mock_trader_addr'
  }
}

const mockLongTradesAction = {
  type: 'DEBUG_TRADE_EVENT',
  returnValues: {
    decisionId: '0',
    netNoCost: '100',
    netYesCost: '100',
    noShortTokenAmount: '0',
    noLongTokenAmount: '250',
    yesShortTokenAmount: '0',
    yesLongTokenAmount: '250',
    tokenAmount: '102',
    trader: 'mock_trader_addr'
  }
}

const shortTrade = {
  decisionId: '0',
  tokenAmount: '102',
  trader: 'mock_trader_addr',
  noTokenName: 'NO-SHORT',
  noTokenAmount: '250',
  yesTokenName: 'YES-SHORT',
  yesTokenAmount: '250',
}

const longTrade = {
  decisionId: '0',
  tokenAmount: '102',
  trader: 'mock_trader_addr',
  noTokenName: 'NO-LONG',
  noTokenAmount: '250',
  yesTokenName: 'YES-LONG',
  yesTokenAmount: '250',
}

describe('trades', () => {
  [
    {
      when: 'when given a set of SHORT outcome token trades',
      should: 'should return state with YES-SHORT and NO-SHORT',
      state: undefined,
      action: mockShortTradesAction,
      expected: [shortTrade]
    },
    {
      when: 'when given a set of LONG outcome token trades',
      should: 'should return state with YES-LONG and NO-LONG',
      state: undefined,
      action: mockLongTradesAction,
      expected: [longTrade]
    },
    {
      when: 'when trades exist in state',
      should: 'should return state with new trades appended',
      state: [shortTrade],
      action: mockLongTradesAction,
      expected: [shortTrade, longTrade]
    }
  ].forEach(({ when, should, state, action, expected }) => {
    describe(when, () => {
      it(should, () => {
        assert.deepEqual(trades(state, action), expected)
      })
    })
  })
})


/* 



*/