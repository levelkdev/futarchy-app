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

  console.log('action ', action.type)
  if (!totals) {
    totals = initialTotals(trader, decisionId)
    state.push(totals)
  }

  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      totals = adjustForBuyPositions(totals, action)
      break
    case 'SELL_MARKET_POSITIONS_EVENT':
      totals = adjustForSellPositions(totals, action)
      break
    case 'REDEEM_SCALAR_WINNINGS_EVENT':
      totals = adjustForScalarWinnings(totals, action)
      break
  }

  return state.map(t => {
    if (t.trader == trader && t.decisionId == decisionId) {
      return totals
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

  totals.yesCostBasis += sumTokenValueArray(yesCosts)
  totals.noCostBasis += sumTokenValueArray(noCosts)
  totals.yesCurrentCollateralRisked += sumTokenValueArray(yesCosts)
  totals.noCurrentCollateralRisked += sumTokenValueArray(noCosts)
  totals.yesCollateralBalance += (parseInt(collateralAmount) - parseInt(yesCosts))
  totals.noCollateralBalance += (parseInt(collateralAmount) - parseInt(noCosts))
  totals.yesShortBalance += parseInt(yesPurchaseAmounts[0])
  totals.yesLongBalance += parseInt(yesPurchaseAmounts[1])
  totals.noShortBalance += parseInt(noPurchaseAmounts[0])
  totals.noLongBalance += parseInt(noPurchaseAmounts[1])

  if (typeof(action.yesMarketFee) != 'undefined') {
    // TODO: calc potential profits here the same way it's done in
    //       the yesNoMarketDataLoadedReducer
  }

  return totals
}

const adjustForSellPositions = (totals, action) => {
  const { returnValues } = action

  totals.yesCurrentCollateralRisked = 0
  totals.noCurrentCollateralRisked = 0
  totals.yesCollateralBalance += parseInt(returnValues.yesCollateralReceived)
  totals.noCollateralBalance += parseInt(returnValues.noCollateralReceived)
  totals.yesShortBalance = 0
  totals.yesLongBalance = 0
  totals.noShortBalance = 0
  totals.noLongBalance = 0
  totals.yesShortPotentialProfit = 0
  totals.yesLongPotentialProfit = 0
  totals.noShortPotentialProfit = 0
  totals.noLongPotentialProfit = 0
  totals.yesPotentialProfit = 0
  totals.noPotentialProfit = 0
  totals.yesGainLoss = 0
  totals.noGainLoss = 0
  totals.totalPotentialProfit = 0
  totals.totalGainLoss = 0
  totals.yesTotalReturns += parseInt(returnValues.yesCollateralReceived)
  totals.noTotalReturns += parseInt(returnValues.noCollateralReceived)
  totals.yesRealizedGainLoss = totals.yesTotalReturns - totals.yesCostBasis
  totals.noRealizedGainLoss = totals.noTotalReturns - totals.noCostBasis
  totals.yesRealizedGainLossPct = calcGainLossPercentage(totals.yesCostBasis, totals.yesTotalReturns)
  totals.noRealizedGainLossPct = calcGainLossPercentage(totals.noCostBasis, totals.noTotalReturns)

  return totals
}

const adjustForScalarWinnings = (totals, action) => {
  let market = action.passed ? 'yes' : 'no'
  const { returnValues } = action
  const { winnings } = returnValues

  totals[`current${market}CollateralRisked`] = 0
  totals[`${market}ShortBalance`] = 0
  totals[`${market}LongBalance`] = 0
  totals.yesShortPotentialProfit = 0
  totals.yesLongPotentialProfit = 0
  totals.noShortPotentialProfit = 0
  totals.noLongPotentialProfit = 0
  totals.yesPotentialProfit = 0
  totals.noPotentialProfit = 0
  totals.yesGainLoss = 0
  totals.noGainLoss = 0
  totals.totalPotentialProfit = 0
  totals.totalGainLoss = 0
  totals[`${market}TotalReturns`] += parseInt(winnings)
  totals[`${market}RealizedGainLoss`] =
    totals[`${market}TotalReturns`] - totals[`${market}CostBasis`]
  totals[`${market}RealizedGainLossPct`] =
    calcGainLossPercentage(totals[`${market}CostBasis`], totals[`${market}TotalReturns`])
  return totals
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
      totals.yesGainLoss = totals.yesPotentialProfit - totals.yesCurrentCollateralRisked
      totals.noGainLoss = totals.noPotentialProfit - totals.noCurrentCollateralRisked
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
    noShortProfit: noProfits.short,
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
  yesCostBasis: 0,                // aggregate TKN spent on YES purchases
  noCostBasis: 0,                 // aggregate TKN spent on NO purchases
  yesCurrentCollateralRisked: 0,  // current YES collateral risked
  noCurrentCollateralRisked: 0,   // current NO collateral risked
  yesCollateralBalance: 0,        // current YES token balance
  noCollateralBalance: 0,         // current NO token balance
  yesShortBalance: 0,             // current yesShort Balance
  yesLongBalance: 0,              // current yesLong Balance
  noShortBalance: 0,              // current noShort Balance
  noLongBalance: 0,               // current noLong Balance
  yesShortPotentialProfit: 0,     // total YES received if yesShortBalance is sold
  yesLongPotentialProfit: 0,      // total YES received if yesLongBalance is sold
  noShortPotentialProfit: 0,      // total NO received if noShortBalance is sold
  noLongPotentialProfit: 0,       // total NO received if noLongBalance is sold
  yesPotentialProfit: 0,          // yesShortPotentialProfit + yesLongPotentialProfit
  noPotentialProfit: 0,           // noShortPotentialProfit + noLongPotentialProfit
  yesGainLoss: 0,                 // yesPotentialProfit - yesCostBasis
  noGainLoss: 0,                  // noPotentialProfit - noCostBasis
  totalPotentialProfit: 0,        // yesPotentialProfit + noPotentialProfit
                                  // (hypothetical value since only YES *or* NO will have value after resolution)
  totalGainLoss: 0,               // gainLoss for YES and NO combined. (also hypothetical for same reason --^)
  yesTotalReturns: 0,             // total revenue received back from yes prediction markets
  noTotalReturns: 0,              // total revenue received back from no prediction markets
  yesRealizedGainLoss: 0,         // total aggregate gains or losses from yes market
  noRealizedGainLoss: 0,          // total aggregate gains or losses from no market
  yesRealizedGainLossPct: 0,
  noRealizedGainLossPct: 0
})

function sumTokenValueArray(tokenVals) {
  return parseInt(tokenVals[0]) + parseInt(tokenVals[1])
}

export default performance
