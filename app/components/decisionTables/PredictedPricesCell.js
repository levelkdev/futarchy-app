import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import formatPredictedValue from '../../util/formatPredictedValue'
import MarketNameStyled from './MarketNameStyled'

const PredictedPricesCell = ({
  yesMarketAveragePricePredicted,
  noMarketAveragePricePredicted
}) => (
  <div>
    <PredictedPrice
      decisionMarketType={decisionMarketTypes.YES}
      price={yesMarketAveragePricePredicted} />
    <PredictedPrice
      decisionMarketType={decisionMarketTypes.NO}
      price={noMarketAveragePricePredicted} />
  </div>
)

const PredictedPrice = ({ decisionMarketType, price }) => (
  <div>
    <Text size="xsmall">
      <MarketNameStyled type={decisionMarketType} />
      <PriceStyled>
        <Bold>{formatPredictedValue(price)}</Bold>
      </PriceStyled>
    </Text>
  </div>
)

const PriceStyled = styled.span`
  margin-left: 10px;
`

const Bold = styled.span`
  font-weight: bold;
`

export default PredictedPricesCell
