import assert from 'assert'
import getWinningMarket from './getWinningMarket'
import decisionStatuses from '../../constants/decisionStatuses'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import mockDecision from '../../test/mockDecision'

describe('getWinningMarket()', () => {
  [
    {
      when: 'when resolve is `false`, status is not OPEN, and `yes` price is highest',
      should: 'should set winningMarket to YES',
      input: mockDecision({
        status: decisionStatuses.RESOLVED,
        yesMarketPrice: 0.2,
        noMarketPrice: 0.1
      }),
      output: decisionMarketTypes.YES
    },
    {
      when: 'when resolve is `false`, status is not OPEN, and `NO` market price is highest',
      should: 'should set winningMarket to NO',
      input: mockDecision({
        status: decisionStatuses.RESOLVED,
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
        status: decisionStatuses.RESOLVED,
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
        status: decisionStatuses.RESOLVED,
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
        status: decisionStatuses.RESOLVED,
        resolved: true,
        passed: true
      }),
      output: decisionMarketTypes.YES
    },
    {
      when: 'when market prices are set, but status is `OPEN`',
      should: 'should not set winningMarket',
      input: mockDecision({
        status: decisionStatuses.OPEN,
        yesMarketPrice: 0.2,
        noMarketPrice: 0.1,
        resolved: false,
        passed: false
      }),
      output: undefined
    },
    {
      when: 'when market prices are not set, status is not `OPEN`, and resolved=`false`',
      should: 'should not set winningMarket',
      input: mockDecision({
        decisionId: 123,
        status: decisionStatuses.RESOLVED,
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
