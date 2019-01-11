import assert from 'assert'
import tradesByAccount from './tradesByAccount'

const mockTrade = account => {
  return {
    trader: account,
    tokenAmount: '25'
  }
}

describe('tradesByAccount', () => {
  [
    {
      when: 'when given an account and an array of trades with multiple matches',
      should: 'should return the trades that match the account',
      givenAccount: '123',
      givenTrades: [mockTrade('abc'), mockTrade('123'), mockTrade('123')],
      expect: [mockTrade('123'), mockTrade('123')]
    },
    {
      when: 'when given an account and an array of trades with no matches',
      should: 'should return an empty array',
      givenAccount: '123',
      givenTrades: [mockTrade('abc'), mockTrade('abc'), mockTrade('abc')],
      expect: []
    }
  ].forEach((t) => {
    describe(t.when, () => {
      it(t.should, () => {
        assert.deepEqual(tradesByAccount(t.givenAccount, t.givenTrades), t.expect)
      })
    })
  })
})
