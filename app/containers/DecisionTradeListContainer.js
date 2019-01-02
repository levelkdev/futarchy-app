import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import TradeList from '../components/TradeList'

const filterTradesByDecisionId = (trades, decisionId) => _.filter(
  trades,
  { decisionId }
)

const mapStateToProps = (state, ownProps) => ({
  trades: filterTradesByDecisionId(state.trades, ownProps.decisionId)
})

export default connect(
  mapStateToProps
)(TradeList)
