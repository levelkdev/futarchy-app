import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import formatBalance from '../../util/formatBalance'

const SingleBalanceCell = ({ balance, tokenSymbol }) => (
  <span>
    <Text size="xsmall">
      <Bold>{formatBalance(balance)}</Bold>
    </Text>
    &nbsp;
    <Text size="xxsmall">
      {tokenSymbol}
    </Text>
  </span>
)

const Bold = styled.span`
  font-weight: bold;
`

export default SingleBalanceCell
