import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Text } from '@aragon/ui'

const QuestionLinkCell = ({
  question,
  decisionId
}) => (
  <LinkStyled to={`/decision/${decisionId}`}>
    <Text size="small">{question}</Text>
  </LinkStyled>
)

const LinkStyled = styled(Link)`
  text-decoration: none;
  cursor: pointer;
`

export default QuestionLinkCell
