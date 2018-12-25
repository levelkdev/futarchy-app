import assert from 'assert'
import {
  accountsLoaded,
  accountsLoadingError,
  tokenBalanceLoaded,
  tokenBalanceLoadingError
} from '../actions'
import initDataLoadStates from './initDataLoadStates'

const testSpecs = [
  {
    prop: 'accounts',
    actionName: 'accountsLoaded',
    action: accountsLoaded({ accounts: ['0x123'] }),
    errorActionName: 'accountsLoadingError',
    errorAction: accountsLoadingError({ errorMessage: 'mock_error' })
  },
  {
    prop: 'tokenBalance',
    actionName: 'tokenBalanceLoaded',
    action: tokenBalanceLoaded({ balance: 'mock_balance' }),
    errorActionName: 'tokenBalanceLoadingError',
    errorAction: tokenBalanceLoadingError({ errorMessage: 'mock_error' })
  }
]

describe('initDataLoadStates', () => {
  describe('default', () => {
    describe('when given undefined state', () => {
      it('should return default state', () => {
        let expectedDefault = {}
        testSpecs.forEach(spec => {
          expectedDefault[spec.prop] = {
            loaded: false,
            errorMessage: null
          }
        })
        assert.deepEqual(
          initDataLoadStates(undefined, { type: 'UNKNOWN' }),
          expectedDefault
        )
      })
    })
  })

  // test the `loaded` and `errorMessage` properties  
  testSpecs.forEach(({ actionName, action, errorActionName, errorAction, prop }) => {
    describe(actionName, () => {
      [
        {
          when: 'when given undefined state',
          should: `should set loaded = true`,
          state: undefined,
          action,
          expected: { errorMessage: null, loaded: true }
        },
        {
          when: 'when given state with an errorMessage',
          should: 'should clear the errorMessage',
          state:  { loaded: false, errorMessage: 'mock_error' },
          action,
          expected: { errorMessage: null, loaded: true }
        }
      ].forEach(({ when, should, state, action, expected }) => {
        describe(when, () => {
          it(should, () => {
            assert.deepEqual(initDataLoadStates(state, action)[prop], expected)
          })
        })
      })
    })

    describe(errorActionName, () => {
      [
        {
          when: 'when given undefined state',
          should: 'should set errorMessage',
          state: undefined,
          errorAction,
          expected: { errorMessage: 'mock_error', loaded: false }
        }
      ].forEach(({ when, should, state, errorAction, expected }) => {
        describe(when, () => {
          it(should, () => {
            assert.deepEqual(initDataLoadStates(state, errorAction)[prop], expected)
          })
        })
      })
    })
  })
})
