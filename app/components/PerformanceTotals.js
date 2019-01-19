import React from 'react'
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Text
} from '@aragon/ui'
import formatBalance from '../util/formatBalance'
import negativePositiveColor from '../util/negativePositiveColor'
import TokenSymbolDisplay from './TokenSymbolDisplay'

const PerformanceTotals = ({
  currentGainLoss, 
  realizedGainLoss,
  tokenBalance,
  tokenRisked
}) => (
  <Table
    header={
      <TableRow>
        <TableHeader title="Gain/Loss (Current)" />
        <TableHeader title="Gain/Loss (Realized)" />
        <TableHeader title="Balance" />
        <TableHeader title="Risked" />
      </TableRow>
    }
  >
    <TableRow>
      <TableCell>
        <Text
          size="xxlarge"
          color={negativePositiveColor(currentGainLoss)}
        >
          {formatBalance(currentGainLoss)}
          <Text size="large">&nbsp;<TokenSymbolDisplay /></Text>
        </Text>
      </TableCell>
      <TableCell>
        <Text
          size="xxlarge"
          color={negativePositiveColor(realizedGainLoss)}
        >
          {formatBalance(realizedGainLoss)} 
          <Text size="large">&nbsp;<TokenSymbolDisplay /></Text>
        </Text>
      </TableCell>
      <TableCell>
        <Text size="xxlarge">{formatBalance(tokenBalance)} 
          <Text size="large">&nbsp;<TokenSymbolDisplay /></Text>
        </Text>
      </TableCell>
      <TableCell>
        <Text size="xxlarge">{formatBalance(tokenRisked)} 
          <Text size="large">&nbsp;<TokenSymbolDisplay /></Text>
        </Text>
      </TableCell>
    </TableRow>
  </Table>
)

export default PerformanceTotals
