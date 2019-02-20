import _ from 'lodash'
import {
  fetchDecisionData,
  fetchTraderDecisionBalances
} from '../actions'

const appEventInterceptor = store => next => action => {
  const state = store.getState()
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      action = addDecisionDataToAction({
        decisions: state.decisionMarkets,
        decisionId: action.returnValues.decisionId,
        action
      })
      break
    case 'START_DECISION_EVENT':
      action = {
        ...action,
        blocktime: state.blocktime || null
      }
      store.dispatch(
        fetchDecisionData(action.returnValues.decisionId)
      )
      if (state.accounts[0]) {
        // TODO: check to see if the decision balances are already pending
        store.dispatch(
          fetchTraderDecisionBalances({
            decisionId: action.returnValues.decisionId,
            trader: state.accounts[0]
          })
        )
      }
      break
    case 'PROP_VALUE_LOADED':
      if (action.prop == 'accounts') {
        for(let i in state.decisionMarkets) {
          // TODO: check to see if the decision balances are already pending
          store.dispatch(
            fetchTraderDecisionBalances({
              decisionId: state.decisionMarkets[i].decisionId,
              trader: action.value[0]
            })
          )
        }
      }
      break
  }

  const result = next(action)

  return result
}

export const addDecisionDataToAction = ({ decisions, decisionId, action }) => {
  const decision = _.find(decisions, { decisionId })

  return {
    ...action,
    lowerBound: decision ? decision.lowerBound : null,
    upperBound: decision ? decision.upperBound : null,
    yesMarketFee: decision ? decision.yesMarketFee : null,
    noMarketFee: decision ? decision.noMarketFee : null,
    yesMarketFunding: decision ? decision.yesMarketFunding : null,
    noMarketFunding: decision ? decision.noMarketFunding : null,
    yesShortOutcomeTokensSold: decision ? decision.yesShortOutcomeTokensSold : null,
    yesLongOutcomeTokensSold: decision ? decision.yesLongOutcomeTokensSold : null,
    noShortOutcomeTokensSold: decision ? decision.noShortOutcomeTokensSold : null,
    noLongOutcomeTokensSold: decision ? decision.noLongOutcomeTokensSold : null
  }
}

export default appEventInterceptor
