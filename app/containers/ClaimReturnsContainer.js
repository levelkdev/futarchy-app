import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { redeemWinnings } from '../actions'
import decisionById from '../reducers/computed/decisionById'
import performanceByIdAndTrader from '../reducers/computed/performanceByIdAndTrader'
import formatBalance from '../util/formatBalance'
import ClaimReturnsForm from '../components/ClaimReturnsForm'

const getReturnsAmount = (decision, performance) => {
  let winningMarket = decision.winningMarket.toLowerCase()
  return formatBalance(performance[`${winningMarket}PotentialProfit`])
}

const mapDispatchToProps = dispatch => ({
  claimReturns: (decisionId) => dispatch(redeemWinnings(decisionId))
})

const mapStateToProps = state => {
  let targetDecision = decisionById(
    state.decisionMarkets,
    state.sidePanel.panelContext.decisionId
  )

  let targetPerforance = performanceByIdAndTrader(
    state.performance,
    state.sidePanel.panelContext.decisionId,
    state.accounts[0]
  )

  return {
    decision: targetDecision,
    returnsAmount: getReturnsAmount(
      targetDecision,
      targetPerforance
    ),
    decisionPassed: targetDecision.passed
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClaimReturnsForm)
