import _ from 'lodash'

const appEventInterceptor = store => next => action => {
  const state = store.getState()
  switch (action.type) {
    case 'DEBUG_TRADE_EVENT':
      action = addDecisionBoundsToAction({
        decisions: state.decisionMarkets,
        decisionId: action.returnValues.decisionId,
        action
      })
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
