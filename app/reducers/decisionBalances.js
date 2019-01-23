import _ from 'lodash'

const decisionBalances = (state = [], action) => {
  switch (action.type) {
    case 'FETCH_TRADER_DECISION_BALANCES_PENDING':
      const existingBalance = _.find(
        state,
        balance => (
          balance.id == action.id &&
            balance.trader == action.trader &&
            balance.pending == false
        )
      )
      if (existingBalance) {
        return state
      }
      return [
        ..._.filter(
          state,
          balance => (
            !(balance.id == action.id &&
              balance.trader == action.trader)
          )
        ),
        ...[initDecisionBalances(action.id, action.trader)]
      ]
    case 'FETCH_TRADER_DECISION_BALANCES_SUCCESS':
      return [
        ..._.filter(
          state,
          balance => (
            !(balance.id == action.id &&
              balance.trader == action.trader)
          )
        ),
        ...[{
          id: action.id,
          trader: action.trader,
          pending: false,
          yesCollateral: action.yesCollateral,
          noCollateral: action.noCollateral,
          noLong: action.noLong,
          noShort: action.noShort,
          yesLong: action.yesLong,
          yesShort: action.yesShort,
        }]
      ]
    default:
      return state
  }
}

const initDecisionBalances = (id, trader) => ({
  id,
  trader,
  pending: true,
  yesCollateral: 0,
  noCollateral: 0,
  noLong: 0,
  noShort: 0,
  yesLong: 0,
  yesShort: 0
})

export default decisionBalances
