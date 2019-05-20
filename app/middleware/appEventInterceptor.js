import _ from 'lodash'
import {
  fetchDecisionData,
  fetchTraderDecisionBalances
} from '../actions'

const appEventInterceptor = store => next => action => {
  const state = store.getState()
  const { latestBlock } = state
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
    case 'REDEEM_SCALAR_WINNINGS_EVENT':
      action = addDecisionDataToAction({
        decisions: state.decisionMarkets,
        decisionId: action.returnValues.decisionId,
        action
      })

      // if this event was fired after the initial app load
      if(state.latestBlock && action.blockNumber > state.latestBlock.number) {
        store.dispatch(
          fetchDecisionData(action.returnValues.decisionId)
        )
      }

      break
    case 'START_DECISION_EVENT':
      action = {
        ...action,
        blocktime: latestBlock ? latestBlock.timestamp : null
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
    passed: decision ? decision.passed : null,
    lowerBound: decision ? decision.lowerBound : null,
    upperBound: decision ? decision.upperBound : null,
    yesMarketFee: decision ? decision.yesMarketFee : null,
    noMarketFee: decision ? decision.noMarketFee : null,
  }
}

export default appEventInterceptor
