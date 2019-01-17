import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import formatPrice from '../../util/formatPrice'
import DecisionMarketName from '../DecisionMarketName'

const PredictedPricesCell = ({
  yesMarketPredictedPrice,
  noMarketPredictedPrice
}) => (
  <PredictedPricesCellStyled>
    <PredictedPrice
      decisionMarketType={decisionMarketTypes.YES}
      price={yesMarketPredictedPrice} />
    <PredictedPrice
      decisionMarketType={decisionMarketTypes.NO}
      price={noMarketPredictedPrice} />
  </PredictedPricesCellStyled>
)

const PredictedPrice = ({ decisionMarketType, price }) => (
  <div>
    <Text size="xsmall">
      <DecisionMarketNameOuter>
        <DecisionMarketName type={decisionMarketType} />
      </DecisionMarketNameOuter>
      <PriceStyled>{formatPrice(price)}</PriceStyled>
    </Text>
  </div>
)

const DecisionMarketNameOuter = styled.div`
  display: inline-block;
  width: 25px;
  text-align: right;
`

const PredictedPricesCellStyled = styled(Text)`
  font-weight: bold;
`

const PriceStyled = styled.span`
  margin-left: 10px
`

export default PredictedPricesCell
