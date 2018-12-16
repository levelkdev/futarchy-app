import _ from 'lodash'

const decisionMarkets = (state = [], action) => {
  switch (action.type) {
    case 'CREATE_DECISION':
      return [
        ...state,
        {
          pending: true,
          id: null,
          question: action.question
        }
      ]
    case 'START_DECISION':
      return [
        ..._.filter(state, event => !event.pending),
        {
          pending: false,
          id: action.returnValues.decisionId,
          question: action.returnValues.metadata
        }
      ]
    default:
      return state
  }
}

export default decisionMarkets
