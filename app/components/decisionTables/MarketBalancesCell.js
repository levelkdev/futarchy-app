import React from 'react'
import styled from 'styled-components'
import { Text, theme } from '@aragon/ui'
import SingleBalanceCell from './SingleBalanceCell'

const MarketBalancesCell = ({
  yesBalance,
  noBalance
}) => (
  <MarketBalancesCellStyled>
    <MarketBalance
      marketName="YES"
      color={theme.gradientStartActive}
      balance={yesBalance} />
    <MarketBalance
      marketName="NO"
      color={theme.gradientEndActive}
      balance={noBalance} />
  </MarketBalancesCellStyled>
)

const MarketBalance = ({ marketName, color, balance }) => (
  <div>
    <Text size="xsmall">
      <MarketNameOuter>
        <Text color={color}>{marketName}</Text>
      </MarketNameOuter>
      <BalanceStyled>
        <SingleBalanceCell balance={balance} />
      </BalanceStyled>
    </Text>
  </div>
)

const MarketNameOuter = styled.div`
  display: inline-block;
  width: 25px;
  text-align: right;
`

const MarketBalancesCellStyled = styled(Text)`
  font-weight: bold;
`

const BalanceStyled = styled.span`
  margin-left: 10px
`

export default MarketBalancesCell
