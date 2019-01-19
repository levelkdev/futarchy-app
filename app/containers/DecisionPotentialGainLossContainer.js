import React from 'react'
import { connect } from 'react-redux'
import findPerformanceTotal from '../reducers/computed/findPerformanceTotal'
import GainLossPercentagesCell from '../components/decisionTables/GainLossPercentagesCell'

const mapStateToProps = (state, ownProps) => {
  const perfTotal = findPerformanceTotal(
    state.performance,
    ownProps.decisionId,
    state.accounts[0]
  )
  return {
    yesGainLossPercentage: calcGainLossPercentage(
      perfTotal.yesCostBasis,
      perfTotal.yesPotentialProfit
    ),
    noGainLossPercentage: calcGainLossPercentage(
      perfTotal.noCostBasis,
      perfTotal.noPotentialProfit
    )
  }
}

const calcGainLossPercentage = (costBasis, saleValue) => {
  return (saleValue - costBasis) / costBasis
}

export default connect(
  mapStateToProps
)(GainLossPercentagesCell)
