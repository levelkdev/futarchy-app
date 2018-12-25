import assert from 'assert'

export default ({ reducer, action, propName, defaultValue, expectedValue }) => {
  describe(propName, () => {
    describe('default', () => {
      describe('when given undefined state', () => {
        it(`should return default value of ${defaultValue}`, () => {
          assert.deepEqual(
            reducer(undefined, { type: 'UNKNOWN' }),
            defaultValue
          )
        })
      })
    })
  
    describe('loaded action', () => {
      [
        {
          when: 'when given undefined state',
          should: `should return expected value of ${expectedValue}`,
          state: undefined,
          action,
          expectedValue
        },
        {
          when: 'when given an action with a prop value',
          should: `should overwrite and return expected value of ${expectedValue}`,
          state: 'mock_existing_value',
          action,
          expectedValue
        }
      ].forEach(({ when, should, state, action, expectedValue }) => {
        describe(when, () => {
          it(should, () => {
            assert.deepEqual(reducer(state, action), expectedValue)
          })
        })
      })
    })
  })
}
