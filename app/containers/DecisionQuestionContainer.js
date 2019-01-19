import React from 'react'
import { connect } from 'react-redux'
import decisionById from '../reducers/computed/decisionById'
import { Text } from '@aragon/ui'

const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  return { question: decision ? decision.question : '' }
}

const QuestionText = ({ question }) => <Text>{question}</Text>

export default connect(
  mapStateToProps
)(QuestionText)
