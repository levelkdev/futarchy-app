import React from 'react'
import { connect } from 'react-redux'
import decisionMarketTypes from '../constants/decisionMarketTypes'
import decisionById from '../reducers/computed/decisionById'
import calcGainLossPercentage from '../reducers/computed/calcGainLossPercentage'
import findPerformanceTotal from '../reducers/computed/findPerformanceTotal'
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
      calcGainLossPercentage(
        perfTotal.currentyesCollateralRisked,
        perfTotal.yesPotentialProfit
      ) :
      calcGainLossPercentage(
        perfTotal.currentnoCollateralRisked,
        perfTotal.noPotentialProfit
      )
  }
}

export default connect(
  mapStateToProps
)(SingleGainLossPercentageCell)
