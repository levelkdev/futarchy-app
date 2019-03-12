import assert from 'assert'
import formatPrice from './formatPrice'

describe('formatPrice', () => {
  [
    {
      when: 'when given a decimal below 10,000 and above 0',
      should: 'should round to 2 decimal places',
      price: 100.123456,
      expected: "100.12"
    },
    {
      when: 'when given a decimal above 10,000',
      should: 'should round to 0 decimal places',
      price: 10000.123456,
      expected: "10000"
    },
    {
      when: 'when given a decimal below zero with no leading zero decimal places',
      should: 'should round to 3 decimal places',
      price: 0.123456,
      expected: "0.123"
    },
    {
      when: 'when given a decimal below zero with leading zero decimal places',
      should: 'should round to 2 decimal places after the leading zeros',
      price: 0.00123456,
      expected: "0.0012"
    },
    {
      when: 'when given 0',
      should: 'should return 0',
      price: 0,
      expected: "0"
    },
  ].forEach(({ when, should, price, expected }) => {
    describe(when, () => {
      it(should, () => {
        assert.equal(formatPrice(price), expected)
      })
    })
  })
})
