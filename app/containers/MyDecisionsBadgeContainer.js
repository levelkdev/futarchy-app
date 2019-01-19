import React from 'react'
import { connect } from 'react-redux'
import filterDecisions from '../reducers/computed/filterDecisions'
import CountBadge from '../components/CountBadge'

const mapStateToProps = (state, ownProps) => ({
  count: filterDecisions(
    state.decisionMarkets,
    state.performance,
    state.accounts[0],
    ownProps.statusFilter
  ).length
})

export default connect(
  mapStateToProps
)(CountBadge)
