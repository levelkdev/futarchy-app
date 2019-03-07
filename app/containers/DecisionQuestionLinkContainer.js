import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import decisionById from '../reducers/computed/decisionById'
import { Text } from '@aragon/ui'


const mapStateToProps = (state, ownProps) => {
  const decision = decisionById(state.decisionMarkets, ownProps.decisionId)
  return {
    question: decision ? decision.question : '',
    decisionId: ownProps.decisionId
  }
}

const QuestionLink = ({
  question,
  decisionId
}) => (
  <LinkStyled to={`/decision/${decisionId}`}>
    <Text>{question}</Text>
  </LinkStyled>
)

export default connect(
  mapStateToProps
)(QuestionLink)

const LinkStyled = styled(Link)`
  text-decoration: none;
  cursor: pointer;
`
