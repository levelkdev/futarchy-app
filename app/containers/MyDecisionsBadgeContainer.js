import React from 'react'
import { connect } from 'react-redux'
import decisionsCount from '../reducers/computed/decisionsCount'
import CountBadge from '../components/CountBadge'

const mapStateToProps = (state, ownProps) => ({
  count: decisionsCount(
    state.decisionMarkets,
    state.performance,
    state.accounts[0],
    ownProps.statusFilter
  )
})

export default connect(
  mapStateToProps
)(CountBadge)
