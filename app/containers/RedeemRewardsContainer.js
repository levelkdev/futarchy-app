import React from 'react'
import { connect } from 'react-redux'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { id: decisionId }
)

const getRewardAmount = (trader, decision) => (
  100
)

const mapStateToProps = state => ({
  decision: findDecisionById(
    state.decisionMarkets,
    state.sidePanel.panelContext.decisionId
  ),
  rewardAmount: getRewardAmount(
    state.accounts[0],
    state.sidePanel.panelContext.decisionId
  )
})

const RedeemRewards = () => (
  <h1> HELLO WORLD </h1>
)

export default connect()(RedeemRewards)
