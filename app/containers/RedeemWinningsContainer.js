import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { decisionId }
)

const getRewardAmount = (decisionBalances, decisionId, passed) => {
  let targetDecisionBalances = _.find(decisionBalances, { decisionId })
  return passed ? targetDecisionBalances.yesCollateral : targetDecisionBalances.noCollateral
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  redeemWinnings: (decisionId) => dispatch(redeemWinnings(decisionId))
})

const decisionStateText = (decision) => {
    const resolvedDecisionText = (decisionPassed) => {
      return decisionPassed ? 'Passed' : 'Failed'
    }
    return !decision.resolved ? 'Unresolved' : resolvedDecisionText(decision.passed)
}

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
    decisionPassed: targetDecision.passed
  }
}

const RedeemWinnings = ({ decision, rewardAmount, winningIndex}) => (
  <div>
    <h1> Decision {decisionStateText(decision)} </h1>
    <h1> Winnings: {rewardAmount} TKN </h1>
    <Button
      mode='strong'
      onClick={ () => redeemWinnings(decision.decisionId) }
    >
      Redeem Winnings
    </Button>
  </div>
)

export default connect(mapStateToProps)(RedeemWinnings)
