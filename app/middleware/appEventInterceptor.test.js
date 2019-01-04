import assert from 'assert'
import { addDecisionBoundsToAction } from './appEventInterceptor'

describe('appEventInterceptor', () => {
  describe('addDecisionBoundsToAction', () => {
    [
      {
        when: 'when there is no decision with the given decisionId',
        should: 'should return an action with null lower and upper bounds',
        decisions: [{ id: 999, lowerBound: "0", upperBound: "50" }],
        decisionId: 123,
        action: { type: 'MOCK' },
        expected: { type: 'MOCK', lowerBound: null, upperBound: null }
      },
      {
        when: 'when there is a decision with the given decisionId',
        should: 'should return an action with lower and upper bounds from the decision',
        decisions: [{ id: 123, lowerBound: "0", upperBound: "50" }],
        decisionId: 123,
        action: { type: 'MOCK' },
        expected: { type: 'MOCK', lowerBound: "0", upperBound: "50" }
      }
    ].forEach(({ when, should, decisions, decisionId, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(
            addDecisionBoundsToAction({ decisions, decisionId, action }),
            expected
          )
        })
      })
    })
  })
})