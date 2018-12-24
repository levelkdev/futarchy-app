import assert from 'assert'
import formatBalance from './formatBalance'

describe('formatBalance', () => {
  [
    {
      when: 'when given 1000 * 10^18',
      should: 'should return "1,000"',
      balance: 1000 * 10 ** 18,
      expected: "1,000"
    }
  ].forEach(({ when, should, balance, expected }) => {
    describe(when, () => {
      it(should, () => {
        assert.equal(formatBalance(balance), expected)
      })
    })
  })
})
