import _ from 'lodash'

const performance = (state = [], action) => {
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      return buyMarketPositionsReducer(state, action)
    case 'POTENTIAL_PROFIT_DATA_LOADED':
      return potentialProfitDataLoadedReducer(state, action)
    default:
      return state
  }
}

const buyMarketPositionsReducer = (state, action) => {
  const { returnValues } = action
  let {
    decisionId,
    trader,
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
}

const potentialProfitDataLoadedReducer = (state, action) => {
  let {
    trader,
    decisionId,
    yesShort,
    yesLong,
    noShort,
    noLong
  } = action

  yesShort = parseInt(yesShort)
  yesLong = parseInt(yesLong)
  noShort = parseInt(noShort)
  noLong = parseInt(noLong)

  let totals = _.find(state, { trader, decisionId })

  totals.yesShortPotentialProfit = yesShort
  totals.yesLongPotentialProfit = yesLong
  totals.noShortPotentialProfit = noShort
  totals.noLongPotentialProfit = noLong
  totals.yesPotentialProfit = yesShort + yesLong
  totals.noPotentialProfit = noShort + noLong
  totals.yesGainLoss = totals.yesPotentialProfit - totals.yesCostBasis
  totals.noGainLoss = totals.noPotentialProfit - totals.noCostBasis
  totals.totalPotentialProfit = totals.yesPotentialProfit + totals.noPotentialProfit
  totals.totalGainLoss =
    totals.totalPotentialProfit - (totals.yesCostBasis + totals.noCostBasis)

  return state.map(t => {
    if (t.trader == trader && t.decisionId == decisionId) {
      return totals
    } else {
      return t
    }
  })
}

const newTotals = (trader, decisionId) => ({
  trader,
  decisionId,
  yesCostBasis: 0,
  noCostBasis: 0,
  yesShortBalance: 0,
  yesLongBalance: 0,
  noShortBalance: 0,
  noLongBalance: 0,
  yesShortPotentialProfit: 0,
  yesLongPotentialProfit: 0,
  noShortPotentialProfit: 0,
  noLongPotentialProfit: 0,
  yesPotentialProfit: 0,
  noPotentialProfit: 0,
  yesGainLoss: 0,
  noGainLoss: 0,
  totalPotentialProfit: 0,
  totalGainLoss: 0
})

function sumTokenValueArray(tokenVals) {
  return parseInt(tokenVals[0]) + parseInt(tokenVals[1])
}

export default performance
