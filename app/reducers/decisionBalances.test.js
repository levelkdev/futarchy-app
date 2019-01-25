import assert from 'assert'
import {
  fetchTraderDecisionBalancesPending,
  fetchTraderDecisionBalancesSuccess
} from '../actions'
import decisionBalances from './decisionBalances'

const mockPendingBalance = (decisionId, trader) => {
  return {
    decisionId,
    trader,
    pending: true,
    yesCollateral: 0,
    noCollateral: 0,
    noLong: 0,
    noShort: 0,
    yesLong: 0,
    yesShort: 0
  }
}

const mockEmptyBalance = (decisionId, trader) => {
  return {
    ...mockPendingBalance(decisionId, trader),
    pending: false
  }
}

const mockBalance = (
  decisionId,
  trader,
  yesCollateral,
  noCollateral,
  noLong,
  noShort,
  yesLong,
  yesShort
) => ({
  decisionId,
  trader,
  pending: false,
  yesCollateral,
  noCollateral,
  noLong,
  noShort,
  yesLong,
  yesShort
})

describe('decisionBalances', () => {
  describe('FETCH_TRADER_DECISION_BALANCES_PENDING', () => {
    describe('when matching pending balance is not in state', () => {
      it('should add the pending balance data', () => {
        const state = [mockPendingBalance(1, 'mock_addr_0')]
        const actualState = decisionBalances(state, fetchTraderDecisionBalancesPending({
          decisionId: 1,
          trader: 'mock_addr_1'
        }))
        assert.deepEqual(actualState[0], mockPendingBalance(1, 'mock_addr_0'))
        assert.deepEqual(actualState[1], mockPendingBalance(1, 'mock_addr_1'))
        assert.equal(actualState.length, 2)
      })
    })

    describe('when matching pending balance is in state', () => {
      it('should not change state', () => {
        const state = [mockPendingBalance(1, 'mock_addr_0')]
        const actualState = decisionBalances(state, fetchTraderDecisionBalancesPending({
          decisionId: 1,
          trader: 'mock_addr_0'
        }))
        assert.deepEqual(actualState[0], mockPendingBalance(1, 'mock_addr_0'))
        assert.equal(actualState.length, 1)
      })
    })

    describe('when matching empty balance is in state', () => {
      it('should not change state', () => {
        const state = [mockEmptyBalance(1, 'mock_addr_0')]
        const actualState = decisionBalances(state, fetchTraderDecisionBalancesPending({
          decisionId: 1,
          trader: 'mock_addr_0'
        }))
        assert.deepEqual(actualState[0], mockEmptyBalance(1, 'mock_addr_0'))
        assert.equal(actualState.length, 1)
      })
    })
  })

  describe('FETCH_TRADER_DECISION_BALANCES_SUCCESS', () => {
    describe('when matching balance is not in state', () => {
      it('should add the balance data', () => {
        const state = [mockEmptyBalance(1, 'mock_addr_0')]
        const actualState = decisionBalances(state, fetchTraderDecisionBalancesSuccess({
          decisionId: 1,
          trader: 'mock_addr_1',
          yesCollateral: 10,
          noCollateral: 11,
          noLong: 12,
          noShort: 13,
          yesLong: 14,
          yesShort: 15
        }))
        assert.deepEqual(actualState[0], mockEmptyBalance(1, 'mock_addr_0'))
        assert.deepEqual(actualState[1], mockBalance(1, 'mock_addr_1', 10, 11, 12, 13, 14, 15))
        assert.equal(actualState.length, 2)
      })
    })

    describe('when matching pending balance is in state', () => {
      it('should overwrite the pending balance', () => {
        const state = [mockPendingBalance(1, 'mock_addr_0')]
        const actualState = decisionBalances(state, fetchTraderDecisionBalancesSuccess({
          decisionId: 1,
          trader: 'mock_addr_0',
          yesCollateral: 10,
          noCollateral: 11,
          noLong: 12,
          noShort: 13,
          yesLong: 14,
          yesShort: 15
        }))
        assert.deepEqual(actualState[0], mockBalance(1, 'mock_addr_0', 10, 11, 12, 13, 14, 15))
        assert.equal(actualState.length, 1)
      })
    })

    describe('when matching non-pending balance is in state', () => {
      it('should overwrite the balance', () => {
        const state = [mockBalance(1, 'mock_addr_0', 100, 101, 102, 103, 104, 105)]
        const actualState = decisionBalances(state, fetchTraderDecisionBalancesSuccess({
          decisionId: 1,
          trader: 'mock_addr_0',
          yesCollateral: 10,
          noCollateral: 11,
          noLong: 12,
          noShort: 13,
          yesLong: 14,
          yesShort: 15
        }))
        assert.deepEqual(actualState[0], mockBalance(1, 'mock_addr_0', 10, 11, 12, 13, 14, 15))
        assert.equal(actualState.length, 1)
      })
    })
  })
})
