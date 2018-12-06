import React from 'react'
import { connect } from 'react-redux'
import DecisionList from '../components/DecisionList'

const mapStateToProps = state => ({
  decisions: state.decisionMarkets
})

export default connect(
  mapStateToProps
)(DecisionList)
