import React from 'react'
import { connect } from 'react-redux'
import DecisionMarketList from '../components/DecisionMarketList'

const getActiveDecisionMarkets = (decisionMarkets) => {
  // TODO: eventually use this function to filter the active markets
  return decisionMarkets
}

const mapStateToProps = state => ({
  decisionMarkets: getActiveDecisionMarkets(state.decisionMarkets)
})

export default connect(
  mapStateToProps
)(DecisionMarketList)
