import React from 'react'
import { connect } from 'react-redux'
import currentGainLoss from '../reducers/computed/currentGainLoss'
import PerformanceTotals from '../components/PerformanceTotals'

const mapStateToProps = state => ({
  currentGainLoss: currentGainLoss(state.accounts[0], state.performance),
  realizedGainLoss: -1234, // TODO: implement when sell/rewards are incorporated into state
  tokenBalance: state.tokenBalance,
  tokenRisked: 1234
})
export default connect(
  mapStateToProps
)(PerformanceTotals)
