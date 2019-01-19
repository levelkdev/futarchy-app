import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import GainLossPercentageDisplay from '../GainLossPercentageDisplay'
import MarketNameStyled from './MarketNameStyled'

const GainLossPercentagesCell = ({
  yesGainLossPercentage,
  noGainLossPercentage
}) => (
  <div>
    <GainLossPercentage
      decisionMarketType={decisionMarketTypes.YES}
      gainLossPercentage={yesGainLossPercentage} />
    <GainLossPercentage
      decisionMarketType={decisionMarketTypes.NO}
      gainLossPercentage={noGainLossPercentage} />
  </div>
)

const GainLossPercentage = ({ decisionMarketType, gainLossPercentage }) => (
  <div>
    <Text size="xsmall">
      <MarketNameStyled type={decisionMarketType} />
      <GainLossDisplayStyled>
        <GainLossPercentageDisplay percentage={gainLossPercentage} />
      </GainLossDisplayStyled>
    </Text>
  </div>
)

const GainLossDisplayStyled = styled.span`
  margin-left: 10px;
`

export default GainLossPercentagesCell
