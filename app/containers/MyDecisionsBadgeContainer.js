import React from 'react'
import { connect } from 'react-redux'
import filterDecisions from '../reducers/computed/filterDecisions'
import CountBadge from '../components/CountBadge'

const mapStateToProps = (state, ownProps) => ({
  count: filterDecisions({
    decisionMarkets: state.decisionMarkets,
    performance: state.performance,
    trader: state.accounts[0],
    status: ownProps.statusFilter
  }).length
})

export default connect(
  mapStateToProps
)(CountBadge)
