import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import SingleBalanceCell from './SingleBalanceCell'
import MarketNameStyled from './MarketNameStyled'

const MarketBalancesCell = ({
  yesBalance,
  noBalance
}) => (
  <div>
    <MarketBalance
      decisionMarketType={decisionMarketTypes.YES}
      balance={yesBalance} />
    <MarketBalance
      decisionMarketType={decisionMarketTypes.NO}
      balance={noBalance} />
  </div>
)

const MarketBalance = ({ decisionMarketType, balance }) => (
  <div>
    <Text size="xsmall">
      <MarketNameStyled type={decisionMarketType} />
      <BalanceStyled>
        <SingleBalanceCell balance={balance} />
      </BalanceStyled>
    </Text>
  </div>
)

const BalanceStyled = styled.span`
  margin-left: 10px;
`

export default MarketBalancesCell
