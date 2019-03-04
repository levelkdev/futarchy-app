import React from 'react'
import { connect } from 'react-redux'
import filterDecisions from '../reducers/computed/filterDecisions'
import DecisionList from '../components/DecisionList'

const mapStateToProps = (state, ownProps) => ({
  decisions: filterDecisions({
    decisionMarkets: state.decisionMarkets,
    status: ownProps.statusFilter
  })
})

export default connect(
  mapStateToProps
)(DecisionList)
