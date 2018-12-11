import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import DecisionSummary from '../components/DecisionSummary'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { id: decisionId }
)

const mapStateToProps = (state, ownProps) => ({
  decision: findDecisionById(state.decisionMarkets, ownProps.decisionId)
})

export default connect(
  mapStateToProps
)(DecisionSummary)
