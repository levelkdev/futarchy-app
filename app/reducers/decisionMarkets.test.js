import assert from 'assert'
import { newDecisionTxPending, startDecision } from '../actions'
import decisionMarkets from './decisionMarkets'

const mockDecision = (n, pending = false) => {
  return { id: `mock_decision_id_${n}`, question: `mock_question_${n}`, pending }
}

describe('decisionMarkets', () => {
  describe('newDecisionTxPending', () => {
    [
      {
        when: 'when there are no existing decisions',
        should: 'should add a pending decision',
        state: [],
        action: newDecisionTxPending({ txHash: 'mock_tx_hash', question: 'mock_question'}),
        expected: [
          { id: 'mock_tx_hash', question: 'mock_question', pending: true }
        ]
      },
      {
        when: 'when there are existing decisions',
        should: 'should add a pending decision after the existing decisions',
        state: [mockDecision(0), mockDecision(1)],
        action: newDecisionTxPending({ txHash: 'mock_tx_hash', question: 'mock_question'}),
        expected: [
          mockDecision(0),
          mockDecision(1),
          { id: 'mock_tx_hash', question: 'mock_question', pending: true }
        ]
      },
      {
        when: 'when the decision already exists in state',
        should: 'should not add the pending decision',
        state: [mockDecision(0)],
        action: newDecisionTxPending({ txHash: 'mock_tx_hash', question: 'mock_question_0'}),
        expected: [mockDecision(0)]
      }
    ].forEach(({ when, should, state, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(decisionMarkets(state, action), expected)
        })
      })
    })
  })

  describe('startDecisionEvent', () => {
    [
      {
        when: 'when there are no existing decisions',
        should: 'should add the new decision',
        state: [],
        action: { 
          type: 'START_DECISION_EVENT',
          returnValues: {
            decisionId: '123',
            metadata: 'mock_question'
          }
        },
        expected: [
          { id: '123', question: 'mock_question', pending: false }
        ]
      },
      {
        when: 'when there are existing decisions',
        should: 'should add the new decision without removing existing decisions',
        state: [mockDecision(0)],
        action: { 
          type: 'START_DECISION_EVENT',
          returnValues: {
            decisionId: '123',
            metadata: 'mock_question_123'
          }
        },
        expected: [
          mockDecision(0),
          { id: '123', question: 'mock_question_123', pending: false }
        ]
      },
      {
        when: 'when there is a pending decision with the same question as the event metadata',
        should: 'should remove the pending decision and add the new decision',
        state: [mockDecision(88, true)],
        action: { 
          type: 'START_DECISION_EVENT',
          returnValues: {
            decisionId: '123',
            metadata: 'mock_question_88'
          }
        },
        expected: [
          { id: '123', question: 'mock_question_88', pending: false }
        ]
      },
      {
        when: 'when there is a pending decision with a different question from the event metadata',
        should: 'should not remove the pending decision, but should add the new decision',
        state: [mockDecision(99, true)],
        action: { 
          type: 'START_DECISION_EVENT',
          returnValues: {
            decisionId: '123',
            metadata: 'mock_question_88'
          }
        },
        expected: [
          mockDecision(99, true),
          { id: '123', question: 'mock_question_88', pending: false }
        ]
      }
    ].forEach(({ when, should, state, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          assert.deepEqual(decisionMarkets(state, action), expected)
        })
      })
    })
  })
})
