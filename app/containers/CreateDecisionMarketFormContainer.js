import React from 'react'
import { connect } from 'react-redux'
import { createDecision, hidePanel } from '../actions'
import CreateDecisionMarketForm from '../components/CreateDecisionMarketForm'

const mapDispatchToProps = dispatch => ({
  createDecision: values => {
    dispatch(createDecision({ question: values.question }))
    dispatch(hidePanel())
  }
})

export default connect(
  null,
  mapDispatchToProps
)(CreateDecisionMarketForm)
