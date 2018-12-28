import assert from 'assert'
import {
  propValueLoaded,
  propValueLoadingError
} from '../actions'
import initDataLoadStates from './initDataLoadStates'
import initDataDefaultState from './initDataDefaultState'

describe('initDataLoadStates', () => {
  describe('default', () => {
    describe('when given undefined state', () => {
      it('should return default state', () => {
        assert.deepEqual(
          initDataLoadStates(undefined, { type: 'UNKNOWN' }),
          initDataDefaultState
        )
      })
    })
  })

  // test the `loaded` and `errorMessage` properties  
  describe('PROP_VALUE_LOADED', () => {
    [
      {
        when: 'when given undefined state',
        should: `should set loaded = true`,
        state: undefined
      },
      {
        when: 'when given state with an errorMessage',
        should: 'should clear the errorMessage',
        state:  { loaded: false, errorMessage: 'mock_error' }
      }
    ].forEach(({ when, should, state, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(
            initDataLoadStates(
              state,
              propValueLoaded({ prop: 'mock_prop', value: 'mock_prop_value' })
            ).mock_prop, 
            { errorMessage: null, loaded: true }
          )
        })
      })
    })
  })

  describe('PROP_VALUE_LOADING_ERROR', () => {
    describe('when given undefined state', () => {
      it('should set errorMessage', () => {
        assert.deepEqual(
          initDataLoadStates(
            undefined,
            propValueLoadingError({ prop: 'mock_prop', errorMessage: 'mock_error_message'})
          ).mock_prop,
          { errorMessage: 'mock_error_message', loaded: false }
        )
      })
    })
  })
})
