import React from 'react'
import styled from 'styled-components'
import { Text } from '@aragon/ui'
import TokenSymbolDisplay from '../TokenSymbolDisplay'
import formatBalance from '../../util/formatBalance'

const SingleBalanceCell = ({ balance }) => (
  <span>
    <Text size="xsmall">
      <b>{formatBalance(balance)}</b>
    </Text>
    &nbsp;
    <Text size="xxsmall">
      <TokenSymbolDisplay />
    </Text>
  </span>
)

export default SingleBalanceCell
