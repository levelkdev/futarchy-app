import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { redeemWinnings } from '../actions'
import ClaimReturnsForm from '../components/ClaimReturnsForm'


const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { decisionId }
)

const getReturnsAmount = (decisionBalances, decisionId, passed) => {
  let targetDecisionBalances = _.find(decisionBalances, { decisionId })
  return passed ? targetDecisionBalances.yesCollateral : targetDecisionBalances.noCollateral
}

const mapDispatchToProps = dispatch => ({
  claimReturns: (decisionId) => dispatch(redeemWinnings(decisionId))
})

const mapStateToProps = state => {
  let targetDecision = findDecisionById(
    state.decisionMarkets,
    state.sidePanel.panelContext.decisionId
  )

  return {
    decision: targetDecision,
    returnsAmount: getReturnsAmount(
      state.decisionBalances,
      state.sidePanel.panelContext.decisionId,
      targetDecision.passed
    ),
    decisionPassed: targetDecision.passed
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClaimReturnsForm)
