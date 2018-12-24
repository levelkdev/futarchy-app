import assert from 'assert'
import { tokenBalanceLoaded } from '../actions'
import tokenBalance from './tokenBalance'

describe('tokenBalance', () => {
  describe('default', () => {
    describe('when given undefined state', () => {
      it('should return null', () => {
        assert.equal(
          tokenBalance(undefined, { type: 'UNKNOWN' }),
          null
        )
      })
    })
  })

  describe('tokenBalanceLoaded', () => {
    [
      {
        when: 'when given undefined state',
        should: 'should return balance',
        state: undefined,
        action: tokenBalanceLoaded({ balance: 123 }),
        expected: 123
      },
      {
        when: 'when given a balance',
        should: 'should overwrite and return new balance',
        state: 123,
        action: tokenBalanceLoaded({ balance: 456 }),
        expected: 456
      }
    ].forEach(({ when, should, state, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(tokenBalance(state, action), expected)
        })
      })
    })
  })
})
