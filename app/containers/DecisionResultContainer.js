import React from 'react'
import { connect } from 'react-redux'
import decisionById from '../reducers/computed/decisionById'
import DecisionResultCell from '../components/decisionTables/DecisionResultCell'

const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  return { decisionResult: decision.winningMarket }
}

export default connect(
  mapStateToProps
)(DecisionResultCell)
