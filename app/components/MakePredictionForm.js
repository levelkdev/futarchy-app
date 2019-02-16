import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import { Button, Info, Text, Badge, DropDown, TextInput } from '@aragon/ui'
import formatPrice from '../util/formatPrice'
import styled from 'styled-components'

const dropDownItems = [
  'less than',
  'more than',
]

const createReduxForm = reduxForm({ form: 'makePredictionForm' })

const MakePredictionForm = createReduxForm(({
  decision,
  handleSubmit,
  executeBuy,
  collateralAmount,
  yesPrediction,
  noPrediction,
  pristine,
  submitting
}) => (
  <form onSubmit={handleSubmit(values => {
    executeBuy({
      decisionId: decision.id,
      ...values
    })
    console.log(`Execute Buy:\n\n${JSON.stringify(values, null, 2)}`);
  })}>
    <StyledRow>
      <StyledSmallCaps>question</StyledSmallCaps>
      <br />
      <StyledText size="large">{decision.question}</StyledText>
      <br />
    </StyledRow>
    <StyledRow>
    <br />
    <StyledSmallCaps>Allocate your tokens</StyledSmallCaps>
      <StyledField
        name="collateralAmount"
        component="input"
        type="text"
        placeholder="Enter Amount to Risk"
      />
      <StyledAccountBalance>XXXX ETH Available</StyledAccountBalance>
    </StyledRow>
    <StyledRow>
      <StyledYesBadge>YES</StyledYesBadge>
      <StyledSmallCaps>price will be:</StyledSmallCaps>
      <br />
      <StyledFlexContainer>
        <div>
          <StyledDropDown name="yesMarket" component="select">
            <option value="" selected disabled>Select an option</option>
            <option value="more">more than</option>
            <option value="less">less than</option>
          </StyledDropDown>
        </div>
        <div>
          <div>
            <StyledSmallCaps>{formatPrice(decision.yesMarketMarginalPredictedPrice)}</StyledSmallCaps>
          </div>
          <StyledSmallCaps>Current <StyledMarketSpan>YES</StyledMarketSpan> price</StyledSmallCaps>
        </div>
      </StyledFlexContainer>
    </StyledRow>
    <StyledRow>
      <StyledNoBadge>NO</StyledNoBadge>
      <StyledSmallCaps>price will be:</StyledSmallCaps>
      <br />
      <StyledFlexContainer>
      <StyledDropDown name="noMarket" component="select">
          <option value="" selected disabled>Select an option</option>
          <option value="more">more than</option>
          <option value="less">less than</option>
        </StyledDropDown>
        <div>
          <div>
            <StyledSmallCaps>{formatPrice(decision.noMarketMarginalPredictedPrice)}</StyledSmallCaps>
          </div>
          <StyledSmallCaps>Current <StyledMarketSpan>NO</StyledMarketSpan> price</StyledSmallCaps>
        </div>
      </StyledFlexContainer>
    </StyledRow>
    <br />
    <br />
    <StyledInfo>
      This will use XXXX of your XXXX ETH
    </StyledInfo>
    <Button mode="strong" type="submit" wide disabled={pristine || submitting}>Make Prediction</Button>
  </form>
))

const StyledDropDown = styled(Field)`
  box-shadow: 0 4px 4px 0 rgba(0,0,0,0.03);
`

const StyledAccountBalance = styled.div`
  width: 100%;
  text-align: right;
  color: #43A047;
  font-size: 12px;
  text-transform: uppercase;
  padding: 5px 0px;
`

const StyledYesBadge = styled(Badge) `
  background-color: #80AEDC;
  color: white;
  font-weight: 400;
  margin-right: 6px;
`

const StyledNoBadge = styled(Badge) `
  background-color: #39CAD0;
  color: white;
  font-weight: 400;
  margin-right: 6px;
`

const StyledFlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const StyledMarketSpan = styled.span`
  font-weight: bold;
`

const StyledMarketPrice = styled(Text) `
  font-size: 14px;
  margin: 0px 18px;
  background-color: #E8E8E8;
  padding: 5px 20px;
  border-radius: 25px;
`

const StyledSmallCaps = styled(Text)`
  text-transform: uppercase;
  font-weight: 500;
  color: #98A0A2;
  font-size: 12px;
  line-height: 28px;
`

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

const StyledText = styled(Text)`
  vertical-align: middle;
  font-weight: bold;
`

const StyledProgressContainer = styled.div`
  height: auto;
  padding: 65px 0px 36px 0px;
`

const StyledRow = styled.div`
  padding: 6px 0px;
`

const StyledInfo = styled(Info.Action)`
  margin: 16px 0;
`

const StyledPermissions = styled(Info.Permissions)`
  margin: 16px 0;
`

const StyledLabel = styled.label`
  font-size: 12px;
  color: #6D777B;
  opacity: .6;
  padding-bottom: 8px;
  text-transform: uppercase;
  display: block;
`

export default MakePredictionForm
