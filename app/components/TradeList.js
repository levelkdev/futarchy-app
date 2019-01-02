import React from 'react'
import styled from 'styled-components'
import formatBalance from '../util/formatBalance'

const TradeList = ({ trades }) => (
  <div>
    <DataTable>
      <tr>
        <DataHeaderCell>TKN Amount</DataHeaderCell>
        <DataHeaderCell>YES Trade</DataHeaderCell>
        <DataHeaderCell>NO Trade</DataHeaderCell>
      </tr>
      {trades.map((trade, i) => (
        <tr key={i}>
          <DataCell>{formatBalance(trade.tokenAmount)}</DataCell>
          <DataCell>{formatBalance(trade.yesTokenAmount)} {trade.yesTokenName}</DataCell>
          <DataCell>{formatBalance(trade.noTokenAmount)} {trade.noTokenName}</DataCell>
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
