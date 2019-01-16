import React from 'react'
import { connect } from 'react-redux'
import decisionById from '../reducers/computed/decisionById'
import PredictedPricesCell from '../components/PredictedPricesCell'

const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  return {
    yesMarketPredictedPrice: decision.yesMarketPredictedPrice,
    noMarketPredictedPrice: decision.noMarketPredictedPrice
  }
}

export default connect(
  mapStateToProps
)(PredictedPricesCell)
