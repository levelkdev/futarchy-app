import _ from 'lodash'
import { ONE } from '../constants/values'
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

          // TODO: get the actual status based on time until the trading period is over.
          //       and the oracle's resolution date. We need to add the resolution period
          //       in addition to the trading period to the Futarchy.sol contract
          status: getStatus({
            blocktime,
            decisionResolutionDate: returnValues.decisionResolutionDate,
            priceResolutionDate: returnValues.priceResolutionDate
          })
        }
      ], decision => decision.startDate ? parseInt(decision.startDate) * -1 : 0)
      break
    case 'DECISION_DATA_LOADED':
      const { decisionId, decisionData } = action
      returnState = state.map(decision => {
          if  (decision.decisionId == decisionId) {
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
          decision.yesMarketAveragePricePredicted = calcPredictedPrice(
            decision.yesMarketAveragePricePercentage,
            decision.lowerBound,
            decision.upperBound
          )
          decision.noMarketAveragePricePredicted = calcPredictedPrice(
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
          decision.yesMarketMarginalPricePredicted = calcPredictedPrice(
            decision.yesMarketMarginalPricePercentage,
            decision.lowerBound,
            decision.upperBound
          )
          decision.noMarketMarginalPricePredicted = calcPredictedPrice(
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
          decision.noLongOutcomeTokensSold = action.noLongOutcomeTokensSold
        }
        return decision
      })
      break
    case 'PROP_VALUE_LOADED':
      if (action.prop == 'blocktime') {
        returnState = state.map(decision => {
          decision.status = getStatus({
            blocktime: action.value,
            decisionResolutionDate: decision.decisionResolutionDate,
            priceResolutionDate: decision.priceResolutionDate
          })
          return decision
        })
      }
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

function getStatus ({
  blocktime,
  decisionResolutionDate,
  priceResolutionDate
}) {
  if (!blocktime) {
    return null
  }
  const blocktimeInt = parseInt(blocktime)
  const decisionResolutionDateInt = parseInt(decisionResolutionDate)
  const priceResolutionDateInt = parseInt(priceResolutionDate)
  if (blocktimeInt < decisionResolutionDateInt)
  {
    return decisionStatuses.OPEN
  } else if (blocktimeInt >= decisionResolutionDateInt &&
             blocktimeInt < priceResolutionDateInt)
  {
    return decisionStatuses.RESOLVED
  } else if (blocktimeInt >= priceResolutionDate) {
    return decisionStatuses.CLOSED
  }
}

function calcPriceAsPercentage (price) {
  return parseInt(price) / ONE
}

function calcPredictedPrice (pricePercentage, lowerBound, upperBound) {
  const lowerBoundInt = parseInt(lowerBound)
  const upperBoundInt = parseInt(upperBound)
  return lowerBoundInt + ((upperBoundInt - lowerBoundInt) * pricePercentage)
}

export default decisionMarkets
