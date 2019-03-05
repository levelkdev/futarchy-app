import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import MarketCircles from '../components/MarketCircles'
import decisionStatuses from'../constants/decisionStatuses'

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
    marketWinner: getMarketWinner(decision)
  }
}

function getMarketWinner (decision) {
  switch (decision.status) {
    case decisionStatuses.OPEN:
      return null
    case decisionStatuses.RESOLVED:
    case decisionStatuses.CLOSED:
      if (decision.yesMarketPrice > decision.noMarketPrice) {
        return "YES"
      } else {
        return "NO"
      }
  }
}

export default connect(
  mapStateToProps
)(MarketCircles)
