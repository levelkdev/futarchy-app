import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Button, Info, Text } from '@aragon/ui'


import formatBalance from '../util/formatBalance'
import styled from 'styled-components'

const createReduxForm = reduxForm({ form: 'createDecisionMarket' })

const CreateDecisionMarketForm = createReduxForm(({
  tokenBalance,
  marketFundAmount,
  handleSubmit,
  createDecision
}) => (
  <form onSubmit={handleSubmit(createDecision)}>
    <StyledInfo>
      This should be a brief explanation of the cost associated with asking a question and how the Futarchy market works.
    </StyledInfo>
    <StyledLabel htmlFor="question">Question</StyledLabel>
    <StyledField
      name="question" 
      component="input" 
      type="text" 
      placeholder="Enter your question"
    />
    <br /><br />
    <FundsContainer>
      <Text>Funding required</Text>
      <Text weight="bold">{formatBalance(marketFundAmount)} TKN</Text>
    </FundsContainer>
    <FundsContainer>
      <Text>Account Balance</Text>
      <Text color="#21D48E">{formatBalance(tokenBalance)}</Text>
    </FundsContainer>
    <br /><br />
      <StyledPermissions>
        Questions placed on the Futarchy Market resolve after 16 days.
      </StyledPermissions>
      <Button mode="strong" type="submit" wide>Create Decision</Button>
  </form>
))

const StyledField = styled(Field)`
  padding: 8px;
  background: #FFFFFF;
  border: 1px solid rgba(209,209,209,0.75);
  box-shadow: inset 0 2px 3px 0 rgba(0,0,0,0.06);
  outline: none;
  width: 100%;
  border-radius: 3px;
  ::placeholder { opacity: .5; }
`

const FundsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 8px;
`

const StyledInfo = styled(Info.Action)`
  margin: 16px 0;
`

const StyledPermissions = styled(Info.Permissions)`
  margin: 16px 0;
`

const StyledLabel = styled.div`
  font-size: 12px;
  color: #6D777B;
  opacity: .6;
  padding-bottom: 8px;
  text-transform: uppercase;
`

export default CreateDecisionMarketForm
