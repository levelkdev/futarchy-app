import assert from 'assert'
import { accountsLoaded, accountsLoadingError } from '../actions'
import initDataLoadStates from './initDataLoadStates'

describe('initDataLoadStates', () => {
  describe('default', () => {
    describe('when given undefined state', () => {
      it('should return default state', () => {
        assert.deepEqual(
          initDataLoadStates(undefined, { type: 'UNKNOWN' }),
          {
            accounts: {
              loaded: false,
              errorMessage: null
            },
            tokenBalance: {
              loaded: false,
              errorMessage: null
            }
          }
        )
      })
    })
  })

  describe('accountsLoaded', () => {
    [
      {
        when: 'when given undefined state',
        should: 'should set accounts.loaded = true',
        state: undefined,
        action: accountsLoaded({ accounts: ['0x123'] }),
        expected: { errorMessage: null, loaded: true }
      },
      {
        when: 'when given state with an errorMessage',
        should: 'should clear the errorMessage',
        state:  { loaded: false, errorMessage: 'mock_error' },
        action: accountsLoaded({ accounts: ['0x123'] }),
        expected: { errorMessage: null, loaded: true }
      }
    ].forEach(({ when, should, state, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(initDataLoadStates(state, action).accounts, expected)
        })
      })
    })
  })

  describe('accountsLoadingError', () => {
    [
      {
        when: 'when given undefined state',
        should: 'should set accounts.errorMessage',
        state: undefined,
        action: accountsLoadingError({ errorMessage: 'mock_error' }),
        expected: { errorMessage: 'mock_error', loaded: false }
      }
    ].forEach(({ when, should, state, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(initDataLoadStates(state, action).accounts, expected)
        })
      })
    })
  })
})
