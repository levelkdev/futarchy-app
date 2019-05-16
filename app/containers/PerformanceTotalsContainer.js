import React from 'react'
import { connect } from 'react-redux'
import currentGainLoss from '../reducers/computed/currentGainLoss'
import realizedGainLoss from '../reducers/computed/realizedGainLoss'
import totalCostBasis from '../reducers/computed/totalCostBasis'
import PerformanceTotals from '../components/PerformanceTotals'

const mapStateToProps = state => ({
  currentGainLoss: currentGainLoss(state.accounts[0], state.performance, state.decisionMarkets),
  realizedGainLoss: realizedGainLoss(state.accounts[0], state.performance, state.decisionMarkets),
  tokenBalance: state.tokenBalance,
  tokenRisked: totalCostBasis(state.accounts[0], state.performance)
})
export default connect(
  mapStateToProps
)(PerformanceTotals)
