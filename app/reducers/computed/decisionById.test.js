import assert from 'assert'
import decisionById from './decisionById'

const mockDecisionMarketData = (decisionId, question ) => ({ decisionId, question })

const decision0 = mockDecisionMarketData(0, 'mock_question_0')
const decision1 = mockDecisionMarketData(1, 'mock_question_1')
const decision2 = mockDecisionMarketData(2, 'mock_question_2')
const decisionMarkets = [ decision0, decision1, decision2 ]

describe('decisionById', () => {
  describe('when given decisions and an id that has a match', () => {
    it('returns the correct decision', () => {
      assert.deepEqual(decisionById(decisionMarkets, 1), decision1)
    })
  })

  describe('when given decisions and an id that does not have a match', () => {
    it('returns undefined', () => {
      assert.equal(decisionById(decisionMarkets, 12), undefined)
    })
  })
})
