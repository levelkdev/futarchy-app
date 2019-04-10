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
        yesShortProfit,
        yesLongProfit,
        noShortProfit,
        noLongProfit
      } = calcProfits({
        action,
        totals
      })
      totals.yesShortPotentialProfit = yesShortProfit
      totals.yesLongPotentialProfit = yesLongProfit
      totals.noShortPotentialProfit = noShortProfit
      totals.noLongPotentialProfit = noLongProfit
      totals.yesPotentialProfit = yesShortProfit + yesLongProfit
      totals.noPotentialProfit = noShortProfit + noLongProfit
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
    yesShortProfit: yesProfits.short,
    yesLongProfit: yesProfits.long,
    noShorProfitt: noProfits.short,
    noLongProfit: noProfits.long
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
  yesCostBasis: 0,              // aggregate TKN spent on YES purchases
  noCostBasis: 0,               // aggregate TKN spent on NO purchases
  yesShortBalance: 0,           // current yesShort Balance
  yesLongBalance: 0,            // current yesLong Balance
  noShortBalance: 0,            // current noShort Balance
  noLongBalance: 0,             // current noLong Balance
  yesShortPotentialProfit: 0,   // total YES received if yesShortBalance is sold
  yesLongPotentialProfit: 0,    // total YES received if yesLongBalance is sold
  noShortPotentialProfit: 0,    // total NO received if noShortBalance is sold
  noLongPotentialProfit: 0,     // total NO received if noLongBalance is sold
  yesPotentialProfit: 0,        // yesShortPotentialProfit + yesLongPotentialProfit
  noPotentialProfit: 0,         // noShortPotentialProfit + noLongPotentialProfit
  yesGainLoss: 0,               // yesPotentialProfit - yesCostBasis
  noGainLoss: 0,                // noPotentialProfit - noCostBasis
  totalPotentialProfit: 0,      // yesPotentialProfit + noPotentialProfit
                                // (hypothetical value since only YES *or* NO will have value after resolution)
  totalGainLoss: 0              // gainLoss for YES and NO combined. (also hypothetical for same reason --^)
})

function sumTokenValueArray(tokenVals) {
  return parseInt(tokenVals[0]) + parseInt(tokenVals[1])
}

export default performance
