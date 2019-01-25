import _ from 'lodash'
import decisionStatuses from '../constants/decisionStatuses'

const ONE = 0x10000000000000000

const decisionMarkets = (state = [], action) => {
  switch (action.type) {
    case 'NEW_DECISION_TX_PENDING':
      return [
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
    case 'START_DECISION_EVENT':
      const { returnValues } = action
      return [
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

          // TODO: get the actual status based on time until the trading period is over.
          //       and the oracle's resolution date. We need to add the resolution period
          //       in addition to the trading period to the Futarchy.sol contract
          status: decisionStatuses.OPEN
        }
      ]
    case 'DECISION_DATA_LOADED':
      const { decisionData } = action
      return []
      // return [
      //   ..._.filter(
      //     state,
      //     decision => !(decision.pending && decision.decisionId == decisionData.decisionId)
      //   ),


    case 'AVG_DECISION_MARKET_PRICES_LOADED':
      return state.map(decision => {
        if (decision.decisionId == action.decisionId) {
          decision.yesMarketPrice = calcPriceAsPercentage(action.yesMarketPrice),
          decision.noMarketPrice = calcPriceAsPercentage(action.noMarketPrice),
          decision.yesMarketPredictedPrice = calcPredictedPrice(
            decision.yesMarketPrice,
            decision.lowerBound,
            decision.upperBound
          )
          decision.noMarketPredictedPrice = calcPredictedPrice(
            decision.noMarketPrice,
            decision.lowerBound,
            decision.upperBound
          )
        }
        return decision
      })
    default:
      return state
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
