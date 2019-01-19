import React from 'react'
import { connect } from 'react-redux'
import currentGainLoss from '../reducers/computed/currentGainLoss'
import totalCostBasis from '../reducers/computed/totalCostBasis'
import PerformanceTotals from '../components/PerformanceTotals'

const mapStateToProps = state => ({
  currentGainLoss: currentGainLoss(state.accounts[0], state.performance),
  realizedGainLoss: -1234, // TODO: implement when sell/rewards are incorporated into state
  tokenBalance: state.tokenBalance,
  tokenRisked: totalCostBasis(state.accounts[0], state.performance)
})
export default connect(
  mapStateToProps
)(PerformanceTotals)
