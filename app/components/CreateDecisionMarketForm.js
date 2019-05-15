import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Button, Info, Text } from '@aragon/ui'
import tokenSymbol from '../util/tokenSymbol'
import formatBalance from '../util/formatBalance'
import styled from 'styled-components'

const createReduxForm = reduxForm({ form: 'createDecisionMarket' })

const CreateDecisionMarketForm = createReduxForm(({
  tokenBalance,
  marketFundAmount,
  handleSubmit,
  createDecision
}) => {
  const insufficientBalance = tokenBalance < marketFundAmount
  const marketFundAmountText = `${formatBalance(marketFundAmount)} ${tokenSymbol()}`
  const tokenBalanceText = `${formatBalance(tokenBalance)} ${tokenSymbol()}`
  return (
    <form onSubmit={handleSubmit(createDecision)}>
      {
        insufficientBalance ?
          <StyledAlert>
            You need at least {marketFundAmountText} to create a decision.
          </StyledAlert> :
          <React.Fragment>
            <StyledInfo>
              Creating a new decision requires {marketFundAmountText} to fund the decision markets.
            </StyledInfo>
            <StyledLabel htmlFor="question">Question</StyledLabel>
            <StyledField
              name="question" 
              component="input" 
              type="text" 
              placeholder="Enter your question"
            />
          </React.Fragment>
      }
      <br /><br />
      <FundsContainer>
        <Text>Funding required</Text>
        <Text weight="bold">{marketFundAmountText}</Text>
      </FundsContainer>
      <FundsContainer>
        <Text>Account Balance</Text>
        <Text color="#21D48E">{tokenBalanceText}</Text>
      </FundsContainer>
      <br /><br />
      <Button mode="strong" type="submit" wide disabled={insufficientBalance}>Create Decision</Button>
    </form>
  )
})

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

const StyledAlert = styled(Info.Alert)`
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
