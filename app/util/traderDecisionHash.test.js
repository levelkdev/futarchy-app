import assert from 'assert'
import traderDecisionHash from './traderDecisionHash'

const expectedHash = '0x34d12e25eda2dfec1fc2e5612b7686320d3329a9c84ad0622715df57797b310a'

describe('traderDecisionHash', () => {
  describe('when given a decisionId and a traderAddress', () => {
    it('should return a hash', () => {
      assert.equal(traderDecisionHash(1, 'a1b2c3'), expectedHash)
    })
  })
})
