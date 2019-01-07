import _ from 'lodash'

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
    default:
      return state
  }
}

export default decisionMarkets
