import _ from 'lodash'
import { ONE } from '../constants/values'
import calcPriceFromPercentage from '../util/calcPriceFromPercentage'
import decisionStatuses from '../constants/decisionStatuses'
import getWinningMarket from './computed/getWinningMarket'

const decisionMarkets = (state = [], action) => {
  let returnState = state
  switch (action.type) {
    case 'NEW_DECISION_TX_PENDING':
      returnState = [
        ...state,
        ...(
          _.find(state, { question: action.question }) ?
            [] : [{
              pending: true,
              decisionId: action.txHash,
              question: action.question
            }]
        )
      ]
      break
    case 'START_DECISION_EVENT':
      const { returnValues, blocktime } = action
      returnState = _.sortBy([
        ..._.filter(
          state,
          decision => !(decision.pending && decision.question == returnValues.metadata)
        ),
        {
          pending: false,
          decisionId: returnValues.decisionId,
          question: returnValues.metadata,
          lowerBound: returnValues.marketLowerBound,
          upperBound: returnValues.marketUpperBound,
          startDate: returnValues.startDate,
          decisionResolutionDate: returnValues.decisionResolutionDate,
          priceResolutionDate: returnValues.priceResolutionDate,
          status: decisionStatuses.OPEN
        }
      ], decision => decision.startDate ? parseInt(decision.startDate) * -1 : 0)
      break
    case 'DECISION_DATA_LOADED':
      const { decisionId, decisionData } = action
      returnState = state.map(decision => {
        if (decision.decisionId == decisionId) {
          decision.passed = decisionData.passed
          decision.resolved = decisionData.resolved
          decision.decisionResolutionDate = decisionData.decisionResolutionDate
        }
        return decision
      })
      break
    case 'AVG_DECISION_MARKET_PRICES_LOADED':
      returnState = state.map(decision => {
        if (decision.decisionId == action.decisionId) {
          decision.yesMarketAveragePricePercentage = calcPriceAsPercentage(action.yesMarketAveragePricePercentage),
          decision.noMarketAveragePricePercentage = calcPriceAsPercentage(action.noMarketAveragePricePercentage),
          decision.yesMarketAveragePricePredicted = calcPriceFromPercentage(
            decision.yesMarketAveragePricePercentage,
            decision.lowerBound,
            decision.upperBound
          )
          decision.noMarketAveragePricePredicted = calcPriceFromPercentage(
            decision.noMarketAveragePricePercentage,
            decision.lowerBound,
            decision.upperBound
          )
        }
        return decision
      })
      break
    case 'MARGINAL_PRICES_LOADED':
      // TODO: refactor logic from AVG_DECISION_MARKET_PRICES_LOADED and write tests
      returnState = state.map(decision => {
        if (decision.decisionId == action.decisionId) {
          decision.yesMarketMarginalPricePercentage = calcPriceAsPercentage(action.yesMarketMarginalPricePercentage),
          decision.noMarketMarginalPricePercentage = calcPriceAsPercentage(action.noMarketMarginalPricePercentage),
          decision.yesMarketMarginalPricePredicted = calcPriceFromPercentage(
            decision.yesMarketMarginalPricePercentage,
            decision.lowerBound,
            decision.upperBound
          )
          decision.noMarketMarginalPricePredicted = calcPriceFromPercentage(
            decision.noMarketMarginalPricePercentage,
            decision.lowerBound,
            decision.upperBound
          )
        }
        return decision
      })
      break
    case 'YES_NO_MARKET_DATA_LOADED':
      returnState = state.map(decision => {
        if (decision.decisionId == action.decisionId) {
          decision.yesMarketFee = action.yesMarketFee,
          decision.noMarketFee = action.noMarketFee,
          decision.yesMarketFunding = action.yesMarketFunding,
          decision.noMarketFunding = action.noMarketFunding,
          decision.yesShortOutcomeTokensSold = action.yesShortOutcomeTokensSold,
          decision.yesLongOutcomeTokensSold = action.yesLongOutcomeTokensSold,
          decision.noShortOutcomeTokensSold = action.noShortOutcomeTokensSold,
          decision.noLongOutcomeTokensSold = action.noLongOutcomeTokensSold,
          decision.winningMarket = action.winningMarket
          decision.winningMarketOutcome = action.winningMarketOutcome
          decision.status = getStatus(decision)
        }
        return decision
      })
      break
    case 'NET_OUTCOME_TOKENS_SOLD_FOR_DECISION_LOADED':
      returnState = state.map(decision => {
        if (decision.id == action.decisionId) {
          if ( action.marketIndex == 0 ) {
            decision.yesMarketShortOutcomeTokensSold = action.shortOutcomeTokensSold,
            decision.yesMarketLongOutcomeTokensSold = action.longOutcomeTokensSold
          } else if (action.marketIndex == 1) {
            decision.noMarketShortOutcomeTokensSold = action.shortOutcomeTokensSold,
            decision.yesMarketLongOutcomeTokensSold = action.longOutcomeTokensSold
          }
        }
      })
      break
  }
  return addComputedProps(returnState)
}

function addComputedProps(decisionArray) {
  return decisionArray.map(decision => {
    const winningMarket = getWinningMarket(decision)
    if (typeof(winningMarket) !== 'undefined') decision.winningMarket = winningMarket
    return decision
  })
}

function getStatus (decision) {
  const { resolved, winningMarketOutcome } = decision
  if (resolved && typeof(winningMarketOutcome) !== 'undefined') {
    return decisionStatuses.CLOSED
  } else if (resolved) {
    return decisionStatuses.RESOLVED
  } else {
    return decisionStatuses.OPEN
  }
}

function calcPriceAsPercentage (price) {
  return parseInt(price) / ONE
}

export default decisionMarkets
