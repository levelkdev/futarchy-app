import React from 'react'
import styled from 'styled-components'
import formatBalance from '../util/formatBalance'

const TradeList = ({ trades }) => (
  <div>
    <DataTable>
      <tr>
        <DataHeaderCell>Time</DataHeaderCell>
        <DataHeaderCell>TKN Amount</DataHeaderCell>
        <DataHeaderCell>YES Amount</DataHeaderCell>
        <DataHeaderCell>YES Cost</DataHeaderCell>
        <DataHeaderCell>NO Amount</DataHeaderCell>
        <DataHeaderCell>NO Cost</DataHeaderCell>
      </tr>
      {trades.map((trade, i) => (
        <tr key={i}>
          <DataCell>{trade.tradeTime}</DataCell>
          <DataCell>{formatBalance(trade.tokenAmount)}</DataCell>
          <DataCell>{formatBalance(trade.yesTokenAmount)} {trade.yesTokenName}</DataCell>
          <DataCell>{formatBalance(trade.netYesCost)} TKN</DataCell>
          <DataCell>{formatBalance(trade.noTokenAmount)} {trade.noTokenName}</DataCell>
          <DataCell>{formatBalance(trade.netNoCost)} TKN</DataCell>
        </tr>
      ))}
    </DataTable>
  </div>
)

const DataTable = styled.table`
  border-collapse: collapse;
`

const DataCell = styled.td`
  border: 1px solid #e8e8e8;
  padding: 5px 8px;
`

const DataHeaderCell = styled(DataCell)`
  font-weight: bold;
`

export default TradeList
