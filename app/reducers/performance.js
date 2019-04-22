import _ from 'lodash'
import calcLMSRProfit from '../util/pmJS/calcLMSRProfit'
import calcGainLossPercentage from './computed/calcGainLossPercentage'

const performance = (state = [], action) => {
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
    case 'SELL_MARKET_POSITIONS_EVENT':
    case 'REDEEM_SCALAR_WINNINGS_EVENT':
      return modifyTraderPositionsReducer(state, action)
    case 'YES_NO_MARKET_DATA_LOADED':
      return yesNoMarketDataLoadedReducer(state, action)
    default:
      return state
  }
}

const modifyTraderPositionsReducer = (state, action) => {
  const { returnValues } = action
  let { trader, decisionId } = returnValues
  let totals = _.find(state, { trader, decisionId })

  if (!totals) {
    totals = initialTotals(trader, decisionId)
    state.push(totals)
  }

  let newTotals
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      newTotals = adjustForBuyPositions(totals, action)
      break
    case 'SELL_MARKET_POSITIONS_EVENT':
      newTotals = adjustForSellPositions(totals, action)
      break
    case 'REDEEM_SCALAR_WINNINGS_EVENT':
      newTotals = adjustForScalarWinnings(totals, action)
      break
  }

  return state.map(t => {
    if (t.trader == trader && t.decisionId == decisionId) {
      return newTotals
    } else {
      return t
    }
  })
}

const adjustForBuyPositions = (totals, action) => {
  const { returnValues } = action
  let {
    decisionId,
    trader,
    collateralAmount,
    yesCosts,
    noCosts,
    yesPurchaseAmounts,
    noPurchaseAmounts
  } = returnValues

  let newTotals = totals

  newTotals.yesCostBasis += sumTokenValueArray(yesCosts)
  newTotals.noCostBasis += sumTokenValueArray(noCosts)
  newTotals.yesCollateralBalance += (parseInt(collateralAmount) - parseInt(yesCosts))
  newTotals.noCollateralBalance += (parseInt(collateralAmount) - parseInt(noCosts))
  newTotals.yesShortBalance += parseInt(yesPurchaseAmounts[0])
  newTotals.yesLongBalance += parseInt(yesPurchaseAmounts[1])
  newTotals.noShortBalance += parseInt(noPurchaseAmounts[0])
  newTotals.noLongBalance += parseInt(noPurchaseAmounts[1])

  if (typeof(action.yesMarketFee) != 'undefined') {
    // TODO: calc potential profits here the same way it's done in
    //       the yesNoMarketDataLoadedReducer
  }

  return newTotals
}

const adjustForSellPositions = (totals, action) => {
  const { returnValues } = action
  let newTotals = totals

  newTotals.yesCollateralBalance += parseInt(returnValues.yesCollateralReceived)
  newTotals.noCollateralBalance += parseInt(returnValues.noCollateralReceived)
  newTotals.yesShortBalance = 0
  newTotals.yesLongBalance = 0
  newTotals.noShortBalance = 0
  newTotals.noLongBalance = 0
  newTotals.yesShortPotentialProfit = 0
  newTotals.yesLongPotentialProfit = 0
  newTotals.noShortPotentialProfit = 0
  newTotals.noLongPotentialProfit = 0
  newTotals.yesPotentialProfit = 0
  newTotals.noPotentialProfit = 0
  newTotals.yesGainLoss = 0
  newTotals.noGainLoss = 0
  newTotals.totalPotentialProfit = 0
  newTotals.totalGainLoss = 0
  newTotals.yesTotalReturns += parseInt(returnValues.yesCollateralReceived)
  newTotals.noTotalReturns += parseInt(returnValues.noCollateralReceived)
  newTotals.yesRealizedGainLoss = newTotals.yesTotalReturns - parseInt(totals.yesCostBasis)
  newTotals.noRealizedGainLoss = newTotals.noTotalReturns - parseInt(totals.noCostBasis)
  newTotals.yesRealizedGainLossPct = calcGainLossPercentage(totals.yesCostBasis, newTotals.yesTotalReturns)
  newTotals.noRealizedGainLossPct = calcGainLossPercentage(totals.noCostBasis, newTotals.noTotalReturns)
  return newTotals
}

const adjustForScalarWinnings = (totals, action) => {
  let newTotals = totals
  let market = action.passed ? 'yes' : 'no'
  const { returnValues } = action
  const { winnings } = returnValues

  newTotals[`${market}ShortBalance`] = 0
  newTotals[`${market}LongBalance`] = 0
  newTotals.yesShortPotentialProfit = 0
  newTotals.yesLongPotentialProfit = 0
  newTotals.noShortPotentialProfit = 0
  newTotals.noLongPotentialProfit = 0
  newTotals.yesPotentialProfit = 0
  newTotals.noPotentialProfit = 0
  newTotals.yesGainLoss = 0
  newTotals.noGainLoss = 0
  newTotals.totalPotentialProfit = 0
  newTotals.totalGainLoss = 0
  newTotals[`${market}TotalReturns`] += parseInt(winnings)
  newTotals[`${market}RealizedGainLoss`] =
    newTotals[`${market}TotalReturns`] - totals[`${market}CostBasis`]
  newTotals[`${market}RealizedGainLossPct`] =
    calcGainLossPercentage(totals[`${market}CostBasis`], newTotals[`${market}TotalReturns`])
  return newTotals
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

const initialTotals = (trader, decisionId) => ({
  trader,
  decisionId,
  yesCostBasis: 0,              // aggregate TKN spent on YES purchases
  noCostBasis: 0,               // aggregate TKN spent on NO purchases
  yesCollateralBalance: 0,      // current YES token balance
  noCollateralBalance: 0,       // current NO token balance
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
  totalGainLoss: 0,             // gainLoss for YES and NO combined. (also hypothetical for same reason --^)
  yesTotalReturns: 0,           // total revenue received back from yes prediction markets
  noTotalReturns: 0,            // total revenue received back from no prediction markets
  yesRealizedGainLoss: 0,       // total aggregate gains or losses from yes market
  noRealizedGainLoss: 0,        // total aggregate gains or losses from no market
  yesRealizedGainLossPct: 0,
  noRealizedGainLossPct: 0
})

function sumTokenValueArray(tokenVals) {
  return parseInt(tokenVals[0]) + parseInt(tokenVals[1])
}

export default performance
