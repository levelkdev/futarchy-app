import React from 'react'
import { connect } from 'react-redux'
import decisionById from '../reducers/computed/decisionById'
import TimeframeCell from '../components/decisionTables/TimeframeCell'

const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  return { time: decision.decisionResolutionDate }
}

export default connect(
  mapStateToProps
)(TimeframeCell)
