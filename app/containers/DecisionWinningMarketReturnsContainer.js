import React from 'react'
import { connect } from 'react-redux'
import decisionMarketTypes from '../constants/decisionMarketTypes'
import decisionById from '../reducers/computed/decisionById'
import findPerformanceTotal from '../reducers/computed/findPerformanceTotal'
import SingleBalanceCell from '../components/decisionTables/SingleBalanceCell'

const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  const perfTotal = findPerformanceTotal(
    state.performance,
    ownProps.decisionId,
    state.accounts[0]
  )
  return {
    balance: decision.winningMarket == decisionMarketTypes.YES ?
      perfTotal.yesPotentialProfit : perfTotal.noPotentialProfit
  }
}

export default connect(
  mapStateToProps
)(SingleBalanceCell)
