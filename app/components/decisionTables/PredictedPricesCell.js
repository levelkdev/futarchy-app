import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import formatPrice from '../../util/formatPrice'
import EtherDisplaySymbol from '../EtherDisplaySymbol'
import MarketNameStyled from './MarketNameStyled'

const PredictedPricesCell = ({
  yesMarketPredictedPrice,
  noMarketPredictedPrice
}) => (
  <div>
    <PredictedPrice
      decisionMarketType={decisionMarketTypes.YES}
      price={yesMarketPredictedPrice} />
    <PredictedPrice
      decisionMarketType={decisionMarketTypes.NO}
      price={noMarketPredictedPrice} />
  </div>
)

const PredictedPrice = ({ decisionMarketType, price }) => (
  <div>
    <Text size="xsmall">
      <MarketNameStyled type={decisionMarketType} />
      <PriceStyled>
        <Bold>{formatPrice(price)}</Bold>&nbsp;<EtherDisplaySymbol />
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
