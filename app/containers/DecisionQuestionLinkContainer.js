import React from 'react'
import { connect } from 'react-redux'
import decisionById from '../reducers/computed/decisionById'
import QuestionLinkCell from '../components/decisionTables/QuestionLinkCell'


const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  return {
    question: decision ? decision.question : '',
    decisionId: ownProps.decisionId
  }
}

export default connect(
  mapStateToProps
)(QuestionLinkCell)
