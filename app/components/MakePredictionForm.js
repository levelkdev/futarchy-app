import React from 'react'
import { Field, reduxForm } from 'redux-form'
import styled from 'styled-components'
import { Button, Text, Badge, DropDown } from '@aragon/ui'
import formatBalance from '../util/formatBalance'
import formatPredictedValue from '../util/formatPredictedValue'
import toWei from '../util/toWei'
import { date, time } from '../util/formatDateTime'
import decisionStatuses from '../constants/decisionStatuses'
import positions from '../constants/positions'
import TokenSymbolDisplay from './TokenSymbolDisplay'
import SuccessMetricDisplay from './SuccessMetricDisplay'

const choiceDisplayTextByPosition = {
  [positions.LONG]: 'more than',
  [positions.SHORT]: 'less than'
}

const dropDownDefault = 2

const noSelectedPosition = position => {
  return position == undefined || position == 0
}

const validate = values => {
  let errors = {}
  if (noSelectedPosition(values.yesPredictionChoiceIndex) && noSelectedPosition(values.noPredictionChoiceIndex)) {
    const error = "You must take at least one market position"
     errors._error = error
  }
  return errors
}

const createReduxForm = reduxForm({ form: 'makePredictionForm', validate })

const MakePredictionForm = createReduxForm(({
  decision,
  handleSubmit,
  executeBuy,
  pristine,
  submitting,
  tokenBalance,
  error,
  submitFailed
}) => (
  <form onSubmit={handleSubmit(values => {
    if (typeof(values.yesPredictionChoiceIndex) === 'undefined') {
      values.yesPredictionChoiceIndex = dropDownDefault
    }
    if (typeof(values.noPredictionChoiceIndex) === 'undefined') {
      values.noPredictionChoiceIndex = dropDownDefault
    }
    values.collateralAmount = toWei(values.collateralAmount)
    executeBuy({
      decisionId: decision.decisionId,
      ...values
    })
  })}>
    <StyledRow>
      <StyledText size="large">{decision.question}</StyledText>
      <br />
    </StyledRow>
    <br />

    <AllocateTokensSection>
      <StyledSmallCaps>Allocate your tokens</StyledSmallCaps>
      <StyledField
        name="collateralAmount"
        component="input"
        type="number"
        placeholder="Enter Amount to Risk"
      />
      <StyledAccountBalance>
        {formatBalance(tokenBalance)} <TokenSymbolDisplay /> Available
      </StyledAccountBalance>
    </AllocateTokensSection>

    <MetricQuestion>
      <Phrase>What will</Phrase>
      <BoldPhrase><SuccessMetricDisplay /></BoldPhrase>
      <Phrase>be on</Phrase>
      <BoldPhrase>{date(decision.priceResolutionDate)}</BoldPhrase>
      <Text size="xsmall">
        <Phrase>at</Phrase>
        <Phrase>{time(decision.priceResolutionDate)}</Phrase>
        <Phrase>?</Phrase>
      </Text>
    </MetricQuestion>

    <SelectorSection>
      <ShortLongSelector
        decision={decision}
        marketKey="yes"
        marketName="YES"
        predictedPrice={decision.yesMarketMarginalPricePredicted}
      />
    </SelectorSection>

    <SelectorSection>
      <ShortLongSelector
        decision={decision}
        marketKey="no"
        marketName="NO"
        predictedPrice={decision.noMarketMarginalPricePredicted}
      />
    </SelectorSection>

    <br />
    {submitFailed && error && <ErrorSection error={error} />}
    <Button mode="strong" type="submit" wide disabled={pristine || submitting}>Make Prediction</Button>
  </form>
))

const ShortLongSelector = ({
  decision,
  marketKey,
  marketName,
  predictedPrice
}) => (
  <StyledRow>
    <StyledSmallCaps>
      <Phrase>If the decision is</Phrase>
      <StyledBadge market={marketKey}>{marketName}</StyledBadge>
      <Phrase>:</Phrase>
    </StyledSmallCaps>
    <div>
      {(decision.status == decisionStatuses.RESOLVED && decision.winningMarket != marketName) ?
        <StyledClosedMarket> Losing market is closed </StyledClosedMarket> :
        <Field
          name={`${marketKey}PredictionChoiceIndex`}
          predictedPrice={predictedPrice}
          component={DropDownField}
          defaultValue={dropDownDefault}
        />
      }
    </div>
  </StyledRow>
)

const DropDownField = (field) => {
  const {
    predictedPrice,
    input,
    defaultValue
  } = field
  return (
    <DropDown
      items={[
        <PositionDropDownItem predictedPrice={predictedPrice} position={positions.LONG} />,
        <PositionDropDownItem predictedPrice={predictedPrice} position={positions.SHORT} />,
        <NoPositionDropDownItem />
      ]}
      active={input.value === '' ? defaultValue : input.value}
      onChange={input.onChange}
    />
  )
}

const PositionDropDownItem = ({ predictedPrice, position }) => (
  <StyledSmallCaps>
    <Phrase>I predict</Phrase>
    <BoldPhrase><SuccessMetricDisplay /></BoldPhrase>
    <Phrase>will be</Phrase>
    <BoldPhrase>{choiceDisplayTextByPosition[position]}</BoldPhrase>
    <StyledMarketPrice>{formatPredictedValue(predictedPrice)}</StyledMarketPrice>
  </StyledSmallCaps>
)

const NoPositionDropDownItem = () => (
  <StyledSmallCaps>
    I don't want to take a position
  </StyledSmallCaps>
)

const ErrorSection = ({ error }) => {
  return (
    <React.Fragment>
      <StyledError>{error}</StyledError>
      <br />
    </React.Fragment>
  )
}

const MetricQuestion = styled.div`
  font-size: 16px;
  margin: 30px 0;
  font-weight: 500;
  color: #98A0A2;
`

const StyledAccountBalance = styled.div`
  width: 100%;
  text-align: right;
  color: #43A047;
  font-size: 12px;
  text-transform: uppercase;
  padding: 5px 0px;
`

const StyledBadge = styled(Badge)`
  background-color: ${props => (props.market == 'yes' ? '#80AEDC' : '#39CAD0')};
  color: white;
  font-weight: 400;
  margin-right: 2px;
`

const StyledClosedMarket = styled.span`
  color: #b30606;
  margin-left: 10px;
`

const StyledSmallCaps = styled(Text)`
  text-transform: uppercase;
  font-weight: 500;
  color: #98A0A2;
  font-size: 12px;
  line-height: 28px;
`

const SelectorSection = styled.div`
  margin-bottom: 30px;
`

const Phrase = styled(Text)`
  margin-right: 3px;
`

const BoldPhrase = styled(Phrase)`
  font-weight: bold;
  color: #848484;
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

const StyledMarketPrice = styled(Text) `
  background-color: #E8E8E8;
  padding: 3px 11px 3px 8px;
  border-radius: 25px;
  margin-left: 2px;
`

const StyledText = styled(Text)`
  vertical-align: middle;
  font-weight: bold;
`

const StyledRow = styled.div`
  padding: 6px 0px;
`

const StyledError = styled.div`
  color: #fd0f0f;
`

const AllocateTokensSection = styled(StyledRow)`
  margin-bottom: 10px;
`

export default MakePredictionForm
