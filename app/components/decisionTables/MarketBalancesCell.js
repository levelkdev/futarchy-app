import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import decisionMarketTypes from '../../constants/decisionMarketTypes'
import DecisionMarketName from '../DecisionMarketName'
import SingleBalanceCell from './SingleBalanceCell'

const MarketBalancesCell = ({
  yesBalance,
  noBalance
}) => (
  <MarketBalancesCellStyled>
    <MarketBalance
      decisionMarketType={decisionMarketTypes.YES}
      balance={yesBalance} />
    <MarketBalance
      decisionMarketType={decisionMarketTypes.NO}
      balance={noBalance} />
  </MarketBalancesCellStyled>
)

const MarketBalance = ({ decisionMarketType, balance }) => (
  <div>
    <Text size="xsmall">
      <MarketNameOuter>
        <DecisionMarketName type={decisionMarketType} />
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
