import React from 'react'
import { connect } from 'react-redux'
import PredictMarketPanel from '../components/PredictMarketPanel'

const mapStateToProps = state => ({
  decisions: state.decisionMarkets
})

export default connect(
  mapStateToProps
)(PredictMarketPanel)
