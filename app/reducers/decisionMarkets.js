import _ from 'lodash'

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
              id: action.txHash,
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
          id: returnValues.decisionId,
          question: returnValues.metadata,
          lowerBound: returnValues.marketLowerBound,
          upperBound: returnValues.marketUpperBound
        }
      ]
    case 'AVG_DECISION_MARKET_PRICES_LOADED':
      return state.map(decision => {
        if (decision.id == action.decisionId) {
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
