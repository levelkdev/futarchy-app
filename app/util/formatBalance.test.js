import assert from 'assert'
import formatBalance from './formatBalance'

describe('formatBalance', () => {
  [
    {
      when: 'when given 1000 * 10^18',
      should: 'should return "1,000.00"',
      balance: 1000 * 10 ** 18,
      expected: "1,000.00"
    },
    {
      when: 'when given .0001 * 10^18',
      should: 'should return "0.0001"',
      balance: .0001 * 10 ** 18,
      expected: "0.0001"
    },
    {
      when: 'when given .000099999 * 10^18',
      should: 'should return "< 0.0001"',
      balance: .000099999 * 10 ** 18,
      expected: "< 0.0001"
    }
  ].forEach(({ when, should, balance, expected }) => {
    describe(when, () => {
      it(should, () => {
        assert.equal(formatBalance(balance), expected)
      })
    })
  })
})
