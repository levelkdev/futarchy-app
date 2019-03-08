import React from 'react'
import { connect } from 'react-redux'
import decisionById from '../reducers/computed/decisionById'
import PredictedPricesCell from '../components/decisionTables/PredictedPricesCell'

const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  return {
    yesMarketAveragePricePredicted: decision.yesMarketAveragePricePredicted,
    noMarketAveragePricePredicted: decision.noMarketAveragePricePredicted
  }
}

export default connect(
  mapStateToProps
)(PredictedPricesCell)
