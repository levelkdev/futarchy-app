import _ from 'lodash'
import { fetchAvgPricesForDecisionMarkets } from '../actions'

const appEventInterceptor = store => next => action => {
  const state = store.getState()
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      action = addDecisionBoundsToAction({
        decisions: state.decisionMarkets,
        decisionId: action.returnValues.decisionId,
        action
      })
      break
    case 'START_DECISION_EVENT':
      store.dispatch(
        fetchAvgPricesForDecisionMarkets(action.returnValues.decisionId)
      )
      break
  }
  return next(action)
}

export const addDecisionBoundsToAction = ({ decisions, decisionId, action }) => {
  const decision = _.find(decisions, { id: decisionId })
  return {
    ...action,
    lowerBound: decision ? decision.lowerBound : null,
    upperBound: decision ? decision.upperBound : null
  }
}

export default appEventInterceptor 
