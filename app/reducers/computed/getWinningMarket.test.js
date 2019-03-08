import assert from 'assert'
import getWinningMarket from './getWinningMarket'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import mockDecision from '../../test/mockDecision'

describe('getWinningMarket()', () => {
  [
    {
      when: 'when resolve is `false`, status is not OPEN, and `yes` price is highest',
      should: 'should set winningMarket to YES',
      input: mockDecision({
        yesMarketPrice: 0.2,
        noMarketPrice: 0.1
      }),
      output: decisionMarketTypes.YES
    },
    {
      when: 'when resolve is `false`, status is not OPEN, and `NO` market price is highest',
      should: 'should set winningMarket to NO',
      input: mockDecision({
        yesMarketPrice: 0.1,
        noMarketPrice: 0.2,
        resolved: false,
        passed: false
      }),
      output: decisionMarketTypes.NO
    },
    {
      when: 'when resolve=`true` and passed=`true`, but `NO` market price is highest',
      should: 'should set winningMarket to YES',
      input: mockDecision({
        yesMarketPrice: 0.1,
        noMarketPrice: 0.2,
        resolved: true,
        passed: true 
      }),
      output: decisionMarketTypes.YES
    },
    {
      when: 'when resolve=`true` and passed=`false`, but `YES` market price is highest',
      should: 'should set winningMarket to NO',
      input: mockDecision({
        yesMarketPrice: 0.2,
        noMarketPrice: 0.1,
        resolved: true,
        passed: false
      }),
      output: decisionMarketTypes.NO
    },
    {
      when: 'when resolve=`true` and passed=`true`, and market prices are not set',
      should: 'should set winningMarket to YES',
      input: mockDecision({
        resolved: true,
        passed: true
      }),
      output: decisionMarketTypes.YES
    },
    {
      when: 'when market prices are not set and resolved=`false`',
      should: 'should not set winningMarket',
      input: mockDecision({
        decisionId: 123,
        resolved: false,
        passed: false
      }),
      output: undefined
    }
  ].forEach(t => describe(t.when, () => {
    const itFn = t.only ? it.only : it
    itFn(t.should, () => {
      assert.equal(getWinningMarket(t.input), t.output)
    })
  }))
})
