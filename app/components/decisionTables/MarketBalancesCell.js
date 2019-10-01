import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import SingleBalanceCell from './SingleBalanceCell'
import MarketNameStyled from './MarketNameStyled'

const MarketBalancesCell = ({
  yesBalance,
  noBalance,
  tokenSymbol
}) => (
  <div>
    <MarketBalance
      decisionMarketType={decisionMarketTypes.YES}
      balance={yesBalance}
      tokenSymbol={tokenSymbol}
    />
    <MarketBalance
      decisionMarketType={decisionMarketTypes.NO}
      balance={noBalance}
      tokenSymbol={tokenSymbol}
    />
  </div>
)

const MarketBalance = ({ decisionMarketType, balance, tokenSymbol }) => (
  <div>
    <Text size="xsmall">
      <MarketNameStyled type={decisionMarketType} />
      <BalanceStyled>
        <SingleBalanceCell
          balance={balance}
          tokenSymbol={tokenSymbol}
        />
      </BalanceStyled>
    </Text>
  </div>
)

const BalanceStyled = styled.span`
  margin-left: 10px;
`

export default MarketBalancesCell
