import React from 'react'
import { connect } from 'react-redux'
import decisionMarketTypes from '../constants/decisionMarketTypes'
import decisionById from '../reducers/computed/decisionById'
import findPerformanceTotal from '../reducers/computed/findPerformanceTotal'
import calcGainLossPercentage from '../reducers/computed/calcGainLossPercentage'
import SingleGainLossPercentageCell from '../components/decisionTables/SingleGainLossPercentageCell'

const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  const perfTotal = findPerformanceTotal(
    state.performance,
    ownProps.decisionId,
    state.accounts[0]
  )
  return {
    percentage: decision.winningMarket == decisionMarketTypes.YES ?
      perfTotal.yesRealizedGainLossPct :
      perfTotal.noRealizedGainLossPct
  }
}

export default connect(
  mapStateToProps
)(SingleGainLossPercentageCell)
