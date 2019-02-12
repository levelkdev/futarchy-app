import _ from 'lodash'
import {
  fetchDecisionData,
  fetchTraderDecisionBalances
} from '../actions'

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
  const newState = store.getState()

  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      // when a new buy is executed on a decision, fetch "potential profit" for each
      // trader who has a balance on the decision's markets. Potential profit is
      // the total amount of collateral token the trader would receive if they sold
      // all of their outcome token positions.
      //
      // TODO: this fetches the data for all past buy events every time the app is
      //       loaded. Since this isn't very efficient, we could do the "calcProfit" from
      //       LMSR calcs client side based on the current marginal price of outcome tokens,
      //       then we'd only need to fetch marginal prices once. But for now, this is simpler.

      // TEMPORARILY REMOVING BECAUSE IT TAKES TOO LONG TO LOAD THIS DATA AND BLOCKS
      // THE APP FROM LOADING EVERYTHING ELSE
      //
      // const { decisionId } = action.returnValues
      // const totalsForDecision = _.filter(newState.performance, { decisionId })
      // for (var i in totalsForDecision) {
      //   const total = totalsForDecision[i]
      //   store.dispatch(fetchPotentialProfitData({
      //     decisionId: total.decisionId,
      //     trader: total.trader,
      //     balances: [
      //       total.yesShortBalance,
      //       total.yesLongBalance,
      //       total.noShortBalance,
      //       total.noLongBalance
      //     ]
      //   }))
      // }
      break
  }
  return result
}

export const addDecisionBoundsToAction = ({ decisions, decisionId, action }) => {
  const decision = _.find(decisions, { decisionId })
  return {
    ...action,
    lowerBound: decision ? decision.lowerBound : null,
    upperBound: decision ? decision.upperBound : null
  }
}

export default appEventInterceptor
