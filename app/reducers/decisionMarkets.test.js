import assert from 'assert'
import {
  newDecisionTxPending,
  avgDecisionMarketPricesLoaded,
  yesNoMarketDataLoaded,
  decisionDataLoaded
} from '../actions'
import decisionMarkets from './decisionMarkets'
import decisionStatuses from '../constants/decisionStatuses'
import mockDecision from '../test/mockDecision'

const ONE = 0x10000000000000000
const SEVENTY_FIVE_PERCENT = (ONE * 0.75) + ''
const FIFTY_PERCENT = (ONE * 0.50) + ''

describe('decisionMarkets', () => {
  describe('newDecisionTxPending', () => {
    [
      {
        when: 'when there are no existing decisions',
        should: 'should add a pending decision',
        state: [],
        action: newDecisionTxPending({ txHash: 'mock_tx_hash', question: 'mock_question'}),
        expected: [
          { decisionId: 'mock_tx_hash', question: 'mock_question', pending: true }
        ]
      },
      {
        when: 'when there are existing decisions',
        should: 'should add a pending decision after the existing decisions',
        state: [
          mockDecision({ decisionId: 0 }),
          mockDecision({ decisionId: 1 })
        ],
        action: newDecisionTxPending({ txHash: 'mock_tx_hash', question: 'mock_question'}),
        expected: [
          mockDecision({ decisionId: 0 }),
          mockDecision({ decisionId: 1 }),
          { decisionId: 'mock_tx_hash', question: 'mock_question', pending: true }
        ]
      },
      {
        when: 'when the decision already exists in state',
        should: 'should not add the pending decision',
        state: [mockDecision({ decisionId: 0 })],
        action: newDecisionTxPending({ txHash: 'mock_tx_hash', question: 'mock_question_0'}),
        expected: [mockDecision({ decisionId: 0 })]
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
            metadata: 'mock_question',
            marketLowerBound: '0',
            marketUpperBound: '1000'
          }
        },
        expected: [
          {
            index: 0,
            props: { decisionId: '123', question: 'mock_question' }
          }
        ]
      },
      {
        when: 'when there are existing decisions',
        should: 'should add the new decision without removing existing decisions',
        state: [mockDecision({ decisionId: 0 })],
        action: {
          type: 'START_DECISION_EVENT',
          returnValues: {
            decisionId: '123',
            metadata: 'mock_question_123',
            marketLowerBound: '0',
            marketUpperBound: '1000'
          }
        },
        expected: [
          { index: 0, props: { decisionId: 'mock_decision_id_0' } },
          { index: 1, props: { decisionId: '123' } }
        ]
      },
      {
        when: 'when there is a pending decision with the same question as the event metadata',
        should: 'should remove the pending decision and add the new decision',
        state: [mockDecision({ decisionId: 88, pending: true })],
        action: {
          type: 'START_DECISION_EVENT',
          returnValues: {
            decisionId: '123',
            metadata: 'mock_question_88',
            marketLowerBound: '0',
            marketUpperBound: '1000'
          }
        },
        expected: [
          { index: 0, props: { decisionId: '123', pending: false } }
        ]
      },
      {
        when: 'when there is a pending decision with a different question from the event metadata',
        should: 'should not remove the pending decision, but should add the new decision',
        state: [mockDecision({ decisionId: 99, pending: true })],
        action: {
          type: 'START_DECISION_EVENT',
          returnValues: {
            decisionId: '123',
            metadata: 'mock_question_88',
            marketLowerBound: '0',
            marketUpperBound: '1000'
          }
        },
        expected: [
          { index: 0, props: { decisionId: 'mock_decision_id_99', pending: true } },
          { index: 1, props: { decisionId: '123', pending: false }}
        ]
      },
      {
        when: 'when the decision action blocktime is less than decisionResolutionDate',
        should: 'should set status to OPEN',
        state: [],
        action: { 
          type: 'START_DECISION_EVENT',
          blocktime: '1500000001',
          returnValues: {
            decisionId: '123',
            startDate: '150000000',
            decisionResolutionDate: '1500000002',
            priceResolutionDate: '1500000003'
          }
        },
        expected: [
          { index: 0, props: { status: decisionStatuses.OPEN } }
        ]
      },
      {
        when: 'when the decision action blocktime is greater than decisionResolutionDate but less than priceResolutionDate',
        should: 'should set status to RESOLVED',
        state: [],
        action: { 
          type: 'START_DECISION_EVENT',
          blocktime: '1500000003',
          returnValues: {
            decisionId: '123',
            startDate: '150000000',
            decisionResolutionDate: '1500000002',
            priceResolutionDate: '1500000004'
          }
        },
        expected: [
          { index: 0, props: { status: decisionStatuses.RESOLVED } }
        ]
      },
      {
        when: 'when the decision action blocktime is greater than priceResolutionDate',
        should: 'should set status to CLOSED',
        state: [],
        action: { 
          type: 'START_DECISION_EVENT',
          blocktime: '1500000006',
          returnValues: {
            decisionId: '123',
            startDate: '150000000',
            decisionResolutionDate: '1500000002',
            priceResolutionDate: '1500000004'
          }
        },
        expected: [
          { index: 0, props: { status: decisionStatuses.CLOSED } }
        ]
      },
      {
        when: 'when the decision action blocktime is null',
        should: 'should set status to null',
        state: [],
        action: { 
          type: 'START_DECISION_EVENT',
          blocktime: null,
          returnValues: {
            decisionId: '123',
            startDate: '150000000',
            decisionResolutionDate: '1500000002',
            priceResolutionDate: '1500000004'
          }
        },
        expected: [
          { index: 0, props: { status: null } }
        ]
      },
      {
        when: 'when decision start time is greater than existing decisions',
        should: 'should add the decision at the start of the array',
        state: [mockDecision({ decisionId: 98 }), mockDecision({ decisionId: 99 })],
        action: { 
          type: 'START_DECISION_EVENT',
          blocktime: null,
          returnValues: {
            decisionId: '123',
            startDate: '150000000',
            decisionResolutionDate: '1500000002',
            priceResolutionDate: '1500000004'
          }
        },
        expected: [
          { index: 0, props: { decisionId: '123' } },
          { index: 1, props: { decisionId: 'mock_decision_id_98' } },
          { index: 2, props: { decisionId: 'mock_decision_id_99' } }
        ]
      }
    ].forEach(({ when, should, state, action, expected }) => {
      describe(when, () => {
        it(should, () => {
          const actualState = decisionMarkets(state, action)
          expected.forEach(expectedCondition => {
            const index = expectedCondition.index
            for (let propName in expectedCondition.props) {
              const expectedVal = expectedCondition.props[propName]
              const actualVal = actualState[index][propName]
              assert.equal(actualVal, expectedVal) 
            }
          })
        })
      })
    })
  })

  describe('avgDecisionMarketPricesLoaded', () => {
    [
      {
        when: 'when there is an existing decision with no avg price data',
        should: 'should return state with new price data',
        state: [mockDecision({ decisionId: 0 }), mockDecision({ decisionId: 123 })],
        action: avgDecisionMarketPricesLoaded({
          decisionId: 'mock_decision_id_123',
          yesMarketAveragePricePercentage: SEVENTY_FIVE_PERCENT,
          noMarketAveragePricePercentage: FIFTY_PERCENT
        }),
        marketIndex: 1,
        expectedProps: {
          yesMarketAveragePricePercentage: 0.75,
          noMarketAveragePricePercentage: 0.50
        }
      },
      {
        when: 'when there is an existing decision with avg price data',
        should: 'should return state with new price data',
        state: [mockDecision({ decisionId: 0 }), {
          ...mockDecision({ decisionId: 123 }),
          ...{
            yesMarketAveragePricePercentage: 0.01,
            noMarketAveragePricePercentage: 0.99
          }
        }],
        action: avgDecisionMarketPricesLoaded({
          decisionId: 'mock_decision_id_123',
          yesMarketAveragePricePercentage: SEVENTY_FIVE_PERCENT,
          noMarketAveragePricePercentage: FIFTY_PERCENT
        }),
        marketIndex: 1,
        expectedProps: {
          yesMarketAveragePricePercentage: 0.75,
          noMarketAveragePricePercentage: 0.50
        }
      },
      {
        when: 'when there is an existing decision with upper and lower bound',
        should: 'should return state with calculated price predictions',
        state: [mockDecision({ decisionId: 0 }), {
          ...mockDecision({ decisionId: 123 }),
          ...{
            lowerBound: '1000',
            upperBound: '2000'
          }
        }],
        action: avgDecisionMarketPricesLoaded({
          decisionId: 'mock_decision_id_123',
          yesMarketAveragePricePercentage: SEVENTY_FIVE_PERCENT,
          noMarketAveragePricePercentage: FIFTY_PERCENT
        }),
        marketIndex: 1,
        expectedProps: {
          yesMarketAveragePricePredicted: 1750,
          noMarketAveragePricePredicted: 1500
        }
      }
    ].forEach(({ when, should, state, action, marketIndex, expectedProps }) => {
      describe(when, () => {
        it(should, () => {
          for (var propName in expectedProps) {
            const expectedPropVal = expectedProps[propName]
            assert.equal(decisionMarkets(state, action)[marketIndex][propName], expectedPropVal)
          }
        })
      })
    })

    describe('when there is no existing decision', () => {
      it('should not change state', () => {
        const state = [mockDecision({ decisionId: 0 }), mockDecision({ decisionId: 1 })]
        const action = avgDecisionMarketPricesLoaded({
          decisionId: 'mock_decision_id_123',
          yesMarketAveragePricePercentage: SEVENTY_FIVE_PERCENT,
          noMarketAveragePricePercentage: FIFTY_PERCENT
        })
        assert.deepEqual(decisionMarkets(state, action), state)
      })
    })
  })

  describe('yesNoMarketDataLoaded', () => {
    [
      {
        when: 'when there is a matching decision',
        should: 'should return state with yes and no market data added to the decision',
        state: [mockDecision({ decisionId: 0 }), mockDecision({ decisionId: 123 })],
        action: yesNoMarketDataLoaded({
          decisionId: 'mock_decision_id_123',
          yesMarketFee: '1',
          noMarketFee: '2',
          yesMarketFunding: '3',
          noMarketFunding: '4',
          yesShortOutcomeTokensSold: '5',
          yesLongOutcomeTokensSold: '6',
          noShortOutcomeTokensSold: '7',
          noLongOutcomeTokensSold: '8'
        }),
        marketIndex: 1,
        expectedProps: {
          yesMarketFee: '1',
          noMarketFee: '2',
          yesMarketFunding: '3',
          noMarketFunding: '4',
          yesShortOutcomeTokensSold: '5',
          yesLongOutcomeTokensSold: '6',
          noShortOutcomeTokensSold: '7',
          noLongOutcomeTokensSold: '8'
        }
      }
    ].forEach(({ when, should, state, action, marketIndex, expectedProps }) => {
      describe(when, () => {
        it(should, () => {
          for (var propName in expectedProps) {
            const expectedPropVal = expectedProps[propName]
            assert.equal(decisionMarkets(state, action)[marketIndex][propName], expectedPropVal)
          }
        })
      })
    })
  })

  describe('decisionDataLoaded', () => {
    [
      {
        when: 'when there is an existing decision with no decision struct data',
        should: 'should return state with new struct data',
        state: [mockDecision({ decisionId: 0 }), mockDecision({ decisionId: 123 })],
        action: decisionDataLoaded({
          decisionId: 'mock_decision_id_123',
          decisionData: {
            resolved: true,
            passed: true
          }
        }),
        marketIndex: 1,
        expectedProps: {
          resolved: true,
          passed: true
        }
      },
      {
        when: 'when there is an existing decision with struct data',
        should: 'should return state with new struct data',
        state: [mockDecision({ decisionId: 0 }), {
          ...mockDecision({ decisionId: 123 }),
          ...{
            resolved: false,
            passed: false
          }
        }],
        action: decisionDataLoaded({
          decisionId: 'mock_decision_id_123',
          decisionData: {
            resolved: true,
            passed: true
          }
        }),
        marketIndex: 1,
        expectedProps: {
          resolved: true,
          passed: true
        }
      }
    ].forEach(({ when, should, state, action, marketIndex, expectedProps }) => {
      describe(when, () => {
        it(should, () => {
          for (var propName in expectedProps) {
            const expectedPropVal = expectedProps[propName]
            assert.equal(decisionMarkets(state, action)[marketIndex][propName], expectedPropVal)
          }
        })
      })
    })
  })

  describe('when blocktime value is loaded', () => {
    it('should update statuses for existing decisions', () => {
      const state = [
        mockDecision({
          decisionId: 0,
          pending: false,
          decisionResolutionDate: '500',
          priceResolutionDate: '600'
        }),
        mockDecision({
          decisionId: 1,
          pending: false,
          decisionResolutionDate: '700',
          priceResolutionDate: '800'
        }),
        mockDecision({
          decisionId: 1,
          pending: false,
          decisionResolutionDate: '900',
          priceResolutionDate: '1000'
        })
      ]
      const action = {
        type: 'PROP_VALUE_LOADED',
        prop: 'blocktime',
        value: '750'
      }
      const actualState = decisionMarkets(state, action)
      assert.equal(actualState[0].status, decisionStatuses.CLOSED)
      assert.equal(actualState[1].status, decisionStatuses.RESOLVED)
      assert.equal(actualState[2].status, decisionStatuses.OPEN)
    })
  })
})
