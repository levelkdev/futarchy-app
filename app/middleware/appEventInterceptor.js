import _ from 'lodash'
import decisionBalancesById from '../reducers/computed/decisionBalancesById'
import findPerformanceTotal from '../reducers/computed/findPerformanceTotal'
import {
  fetchDecisionData,
  fetchTraderReturns,
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
              trader: action.value[0],
            })
          )
        }
      }
      break
      case 'FETCH_TRADER_DECISION_BALANCES_SUCCESS':
      case 'AVG_DECISION_MARKET_PRICES_LOADED':
        for(let i in state.decisionMarkets) {
          let decisionBalance = decisionBalancesById(state.decisionBalances, i)
          let performanceTotals = findPerformanceTotal(state.performance, i, state.accounts[0])
          console.log('state!!', state)

          if (
            state.decisionMarkets[i].winningMarket &&
            state.decisionMarkets[i].status == 'CLOSED'
            !decisionBalance.pending
          ){
            const marketName = state.decisionMarkets[i].winningMarket.toLowerCase()
            store.dispatch(fetchTraderReturns({
              decisionId: state.decisionMarkets[i].decisionId,
              trader: state.accounts[0],
              longBalance: decisionBalance[`${marketName}Long`],
              shortBalance: decisionBalance[`${marketName}Short`],
              decisionStatus: state.decisionMarkets[i].status,
              winningMarket: state.decisionMarkets[i].winningMarket,
              futarchyOracleAddr: state.decisionMarkets[i].futarchyOracleAddress
            }))
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
