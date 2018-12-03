import _ from 'lodash'

const decisionMarkets = (state = [], action) => {
  switch (action.type) {
    case 'SEND_CREATE_DECISION_MARKET':
      return [
        ...state,
        {
          pending: true,
          id: null,
          question: action.question
        }
      ]
    case 'UPDATE_APP_EVENTS':
      return _.filter(action.events, { event: 'DecisionCreated' }).map(event => ({
        pending: false,
        id: event.returnValues.id,
        question: event.returnValues.metadata
      }))
    default:
      return state
  }
}

export default decisionMarkets
