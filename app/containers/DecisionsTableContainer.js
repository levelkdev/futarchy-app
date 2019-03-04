import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import filterDecisions from '../reducers/computed/filterDecisions'
import DecisionsTable from '../components/decisionTables/DecisionsTable'

const mapStateToProps = (state, ownProps) => ({
  statusFilter: ownProps.statusFilter,
  decisionIds: _.map(filterDecisions({
    decisionMarkets: state.decisionMarkets,
    performance: state.performance,
    trader: state.accounts[0],
    status: ownProps.statusFilter
  }), decision => decision.decisionId) || []
})

export default connect(
  mapStateToProps
)(DecisionsTable)
