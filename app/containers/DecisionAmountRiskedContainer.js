import React from 'react'
import { connect } from 'react-redux'
import findPerformanceTotal from '../reducers/computed/findPerformanceTotal'
import SingleBalanceCell from '../components/decisionTables/SingleBalanceCell'

const mapStateToProps = (state, ownProps) => {
  const perfTotal = findPerformanceTotal(
    state.performance,
    ownProps.decisionId,
    state.accounts[0]
  )
  return {
    balance: perfTotal.yesCostBasis
  }
}

export default connect(
  mapStateToProps
)(SingleBalanceCell)
