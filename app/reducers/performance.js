import _ from 'lodash'

const performance = (state = [], action) => {
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      const { returnValues } = action
      const {
        decisionId,
        trader,
        tradeTime,
        collateralAmount,
        yesCosts,
        noCosts,
        yesPurchaseAmounts,
        noPurchaseAmounts
      } = returnValues

      let totals = _.find(state, { trader, decisionId })
      if (!totals) {
        totals = newTotals(trader, decisionId)
        state.push(totals)
      }

      totals.yesCostBasis += sumTokenValueArray(yesCosts)
      totals.noCostBasis += sumTokenValueArray(noCosts)
      totals.yesShortBalance += parseInt(yesPurchaseAmounts[0])
      totals.yesLongBalance += parseInt(yesPurchaseAmounts[1])
      totals.noShortBalance += parseInt(noPurchaseAmounts[0])
      totals.noLongBalance += parseInt(noPurchaseAmounts[1])

      return state.map(t => {
        if (t.trader == trader && t.decisionId == decisionId) {
          return totals
        } else {
          return t
        }
      })
    default:
      return state
  }
}

const newTotals = (trader, decisionId) => ({
  trader,
  decisionId,
  yesCostBasis: 0,
  noCostBasis: 0,
  yesShortBalance: 0,
  yesLongBalance: 0,
  noShortBalance: 0,
  noLongBalance: 0
})

function sumTokenValueArray(tokenVals) {
  return parseInt(tokenVals[0]) + parseInt(tokenVals[1])
}

export default performance
