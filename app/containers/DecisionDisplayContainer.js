import React from 'react'
import { connect } from 'react-redux'
import DecisionDisplay from '../components/DecisionDisplay'

const mapStateToProps = (state, ownProps) => ({
  decisionCount: state.decisionMarkets.length
})

export default connect(
  mapStateToProps
)(DecisionDisplay)
