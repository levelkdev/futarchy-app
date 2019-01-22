import React from 'react'
import { connect } from 'react-redux'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { id: decisionId }
)

const mapStateToProps = state => ({
  decision: findDecisionById(
    state.decisionMarkets,
    state.sidePanel.panelContext.decisionId
  )
})

const RedeemRewards = () => (
  <h1> HELLO WORLD </h1>
)

export default connect()(RedeemRewards)
