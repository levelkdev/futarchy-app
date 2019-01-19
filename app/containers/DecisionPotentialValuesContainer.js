import React from 'react'
import { connect } from 'react-redux'
import findPerformanceTotal from '../reducers/computed/findPerformanceTotal'
import MarketBalancesCell from '../components/decisionTables/MarketBalancesCell'

const mapStateToProps = (state, ownProps) => {
  const perfTotal = findPerformanceTotal(
    state.performance,
    ownProps.decisionId,
    state.accounts[0]
  )
  return {
    yesBalance: perfTotal.yesPotentialProfit,
    noBalance: perfTotal.noPotentialProfit
  }
}

export default connect(
  mapStateToProps
)(MarketBalancesCell)
