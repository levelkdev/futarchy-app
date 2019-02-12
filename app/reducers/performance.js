import _ from 'lodash'
import calcLMSRProfit from '../util/pmJS/calcLMSRProfit'

const performance = (state = [], action) => {
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      return buyMarketPositionsReducer(state, action)
    case 'YES_NO_MARKET_DATA_LOADED':
      return yesNoMarketDataLoadedReducer(state, action)
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

  if (typeof(action.yesMarketFee) != 'undefined') {
    // TODO: calc potential profits here the same way it's done in
    //       the yesNoMarketDataLoadedReducer
  }

  return state.map(t => {
    if (t.trader == trader && t.decisionId == decisionId) {
      return totals
    } else {
      return t
    }
  })
}

const yesNoMarketDataLoadedReducer = (state, action) => {
  return state.map(totals => {
    if (totals.decisionId == action.decisionId) {
      const {
        yesShort,
        yesLong,
        noShort,
        noLong
      } = calcProfits({
        action,
        totals
      })
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
    }
    return totals
  })
}

const calcProfits = ({ action, totals }) => {
  const {
    yesShortBalance,
    yesLongBalance,
    noShortBalance,
    noLongBalance
  } = totals
  const {
    yesShortOutcomeTokensSold,
    yesLongOutcomeTokensSold,
    noShortOutcomeTokensSold,
    noLongOutcomeTokensSold,
    yesMarketFunding,
    noMarketFunding,
    yesMarketFee,
    noMarketFee
  } = action
  const yesProfits = calcProfitForMarket({
    shortOutcomeTokensSold: yesShortOutcomeTokensSold,
    longOutcomeTokensSold: yesLongOutcomeTokensSold,
    funding: yesMarketFunding,
    shortBalance: yesShortBalance,
    longBalance: yesLongBalance,
    feeFactor: yesMarketFee
  })
  const noProfits = calcProfitForMarket({
    shortOutcomeTokensSold: noShortOutcomeTokensSold,
    longOutcomeTokensSold: noLongOutcomeTokensSold,
    funding: noMarketFunding,
    shortBalance: noShortBalance,
    longBalance: noLongBalance,
    feeFactor: noMarketFee
  })
  return {
    yesShort: yesProfits.short,
    yesLong: yesProfits.long,
    noShort: noProfits.short,
    noLong: noProfits.long
  }
}

const calcProfitForMarket = ({
  shortOutcomeTokensSold,
  longOutcomeTokensSold,
  funding,
  shortBalance,
  longBalance,
  feeFactor
}) => {
  const netOutcomeTokensSold = [
    shortOutcomeTokensSold,
    longOutcomeTokensSold
  ]
  return {
    short: parseInt(calcLMSRProfit({
      netOutcomeTokensSold,
      funding,
      outcomeTokenIndex: 0,
      outcomeTokenCount: shortBalance,
      feeFactor
    })),
    long: parseInt(calcLMSRProfit({
      netOutcomeTokensSold,
      funding,
      outcomeTokenIndex: 1,
      outcomeTokenCount: longBalance,
      feeFactor
    }))
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
