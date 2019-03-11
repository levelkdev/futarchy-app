import assert from 'assert'
import calcPriceFromPercentage from './calcPriceFromPercentage'

describe('calcPriceFromPercentage()', () => {
  describe('when given price percentage, lowerbound, and upperbound', () => {
    it ('should return price within lower/upper bound range', () => {
      assert.equal(calcPriceFromPercentage(.5, '0', '100'), 50)
    })
  })
})
