import React from 'react'
import { connect } from 'react-redux'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { id: decisionId }
)

const getRewardAmount = (decisionBalances, ) => (
 0
)

const didDecisionPass = (decision) => (
  decision.passed
)

const mapStateToProps = state => {
  let targetDecision = findDecisionById(
    state.decisionMarkets,
    state.sidePanel.panelContext.decisionId
  )

  return {
    decision: targetDecision,
    rewardAmount: getRewardAmount(
      state.decisionBalances,
      state.sidePanel.panelContext.decisionId
    ),
    decisionPassed: didDecisionPass(
      targetDecision
    )
  }
}

const RedeemWinnings = () => (
  <h1> HELLO WORLD </h1>
)

export default connect()(RedeemWinnings)
