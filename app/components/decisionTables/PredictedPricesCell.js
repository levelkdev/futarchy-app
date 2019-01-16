import React from 'react'
import styled from 'styled-components'
import { Text, theme } from '@aragon/ui'
import formatPrice from '../../util/formatPrice'

const PredictedPricesCell = ({
  yesMarketPredictedPrice,
  noMarketPredictedPrice
}) => (
  <PredictedPricesCellStyled>
    <PredictedPrice
      marketName="YES"
      color={theme.gradientStartActive}
      price={yesMarketPredictedPrice} />
    <PredictedPrice
      marketName="NO"
      color={theme.gradientEndActive}
      price={noMarketPredictedPrice} />
  </PredictedPricesCellStyled>
)

const PredictedPrice = ({ marketName, color, price }) => (
  <div>
    <Text size="xsmall">
      <MarketNameOuter>
        <Text color={color}>{marketName}</Text>
      </MarketNameOuter>
      <PriceStyled>{formatPrice(price)}</PriceStyled>
    </Text>
  </div>
)

const MarketNameOuter = styled.div`
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
