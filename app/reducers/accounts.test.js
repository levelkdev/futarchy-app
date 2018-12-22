import assert from 'assert'
import { accountsLoaded } from '../actions'
import accounts from './accounts'

describe('accounts', () => {
  describe('default', () => {
    describe('when given undefined state', () => {
      it('should return empty array', () => {
        assert.deepEqual(
          accounts(undefined, { type: 'UNKNOWN' }),
          []
        )
      })
    })
  })

  describe('accountsLoaded', () => {
    [
      {
        when: 'when given undefined state',
        should: 'should return accounts array',
        state: undefined,
        action: accountsLoaded({ accounts: ['0x123', '0x456'] }),
        expected: ['0x123', '0x456']
      },
      {
        when: 'when given an array of accounts',
        should: 'should overwrite and return new accounts array',
        state: ['0x789'],
        action: accountsLoaded({ accounts: ['0x123', '0x456'] }),
        expected: ['0x123', '0x456']
      }
    ].forEach(({ when, should, state, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(accounts(state, action), expected)
        })
      })
    })
  })
})