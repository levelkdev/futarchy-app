import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Button, Info, Text } from '@aragon/ui'
import { ProgressBar, Step } from "react-step-progress-bar"

import formatBalance from '../util/formatBalance'
import styled from 'styled-components'
import StepProgressBar from './StepProgressBar'



const createReduxForm = reduxForm({ form: 'makePrediction' })

const MakePredictionForm = createReduxForm(({
  decision,
  handleSubmit,
  executeBuy
}) => (
  <form onSubmit={handleSubmit(values => {
    executeBuy({
      decisionId: decision.id,
      ...values
    })
  })}>
    <StyledInfo>
      Make Prediction...
    </StyledInfo>
    <StepProgressBar progress={.25}>
      <Step>
        {({ accomplished, index }) => (
          <StyledStep>
            {index + 1}
          </StyledStep>
        )}
      </Step> 
      <Step>
        {({ accomplished, index }) => (
          <StyledStep>
            {index + 1}
          </StyledStep>
        )}
      </Step> 
    </StepProgressBar>
    <StyledLabel htmlFor="collateralAmount">
      Collateral Amount
    </StyledLabel>
    <StyledField
      name="collateralAmount"
      component="input"
      type="text"
      placeholder="Collateral Amount"
    />
    <br /><br />

    <StyledLabel htmlFor="yesShortAmount">
      YES-SHORT Amount
    </StyledLabel>
    <StyledField
      name="yesShortAmount"
      component="input"
      type="text"
      placeholder="YES-SHORT Amount"
    />
    <br /><br />

    <StyledLabel htmlFor="yesLongAmount">
      YES-LONG Amount
    </StyledLabel>
    <StyledField
      name="yesLongAmount"
      component="input"
      type="text"
      placeholder="YES-LONG Amount"
    />
    <br /><br />

    <StyledLabel htmlFor="noShortAmount">
      NO-SHORT Amount
    </StyledLabel>
    <StyledField
      name="noShortAmount"
      component="input"
      type="text"
      placeholder="NO-SHORT Amount"
    />
    <br /><br />

    <StyledLabel htmlFor="noLongAmount">
      NO-LONG Amount
    </StyledLabel>
    <StyledField
      name="noLongAmount"
      component="input"
      type="text"
      placeholder="NO-LONG Amount"
    />
    <br /><br />

    <Button mode="strong" type="submit" wide>Make Prediction</Button>
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

const StyledStep  = styled.div`
  color: white;
  width: 20px;
  height: 20px;
  font-size: 12px;
  background-color: rgba(211, 211, 211, 0.8);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`


export default MakePredictionForm
