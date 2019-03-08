import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import decisionStatuses from '../constants/decisionStatuses'
import MarketCircles from '../components/MarketCircles'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { decisionId }
)

const mapStateToProps = (state, ownProps) => {
  const decision = findDecisionById(state.decisionMarkets, ownProps.decisionId)
  return {
    yesDisplayPrice: decision.yesMarketPredictedPrice,
    noDisplayPrice: decision.noMarketPredictedPrice,
    yesPercentage: decision.yesMarketPrice,
    noPercentage: decision.noMarketPrice,
    marketWinner: decision.status !== decisionStatuses.OPEN && decision.winningMarket
  }
}

export default connect(
  mapStateToProps
)(MarketCircles)
