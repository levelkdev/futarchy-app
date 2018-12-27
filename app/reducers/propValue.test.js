import assert from 'assert'
import { propValueLoaded } from '../actions'
import propValue from './propValue'

const mockProp = 'mock_prop'
const mockDefaultValue = 'mock_default_value'
const mockValue = 'mock_value'

const propValueReducer = propValue({
  prop: mockProp,
  defaultValue: mockDefaultValue
})

const propValueAction = propValueLoaded({
  prop: mockProp,
  value: mockValue
})

describe('propValue', () => {
  describe('default', () => {
    describe('when given undefined state', () => {
      it(`should return default value of ${mockDefaultValue}`, () => {
        assert.deepEqual(
          propValueReducer(undefined, { type: 'UNKNOWN' }),
          mockDefaultValue
        )
      })
    })
  })

  describe('loaded action', () => {
    [
      {
        when: 'when given undefined state',
        should: `should return expected value of ${mockValue}`,
        state: undefined
      },
      {
        when: 'when given an action with a prop value',
        should: `should overwrite and return expected value of ${mockValue}`,
        state: 'mock_existing_value'
      }
    ].forEach(({ when, should, state }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(propValueReducer(state, propValueAction), mockValue)
        })
      })
    })
  })
})
