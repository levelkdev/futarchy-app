import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import MakePredictionForm from '../components/MakePredictionForm'

const findDecisionById = (decisions, decisionId) => {
  _.find(
  decisions,
  { id: decisionId }
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    // decision: {id: '1'}
  decision: findDecisionById(state.decisionMarkets, ownProps.decisionId)
  }
}

export default connect(
  mapStateToProps
)(MakePredictionForm)
