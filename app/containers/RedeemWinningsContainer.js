import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { decisionId }
)

const getRewardAmount = (decisionBalances, decisionId, passed) => {
  let targetDecisionBalances = _.find(decisionBalances, decisionId)
  return passed ? targetDecisionBalances.yesCollateral : targetDecisionBalances.noCollateral
}

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
      state.sidePanel.panelContext.decisionId,
      targetDecision.passed
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
