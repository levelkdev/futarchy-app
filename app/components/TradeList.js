import React from 'react'
import styled from 'styled-components'
import formatBalance from '../util/formatBalance'
import moment from 'moment'

const TradeList = ({ trades }) => (
  <div>
    <DataTable>
      <tbody>
        <tr>
          <DataHeaderCell>Time</DataHeaderCell>
          <DataHeaderCell>TKN Amount</DataHeaderCell>
          <DataHeaderCell>YES Amount</DataHeaderCell>
          <DataHeaderCell>YES Cost</DataHeaderCell>
          <DataHeaderCell>YES Price</DataHeaderCell>
          <DataHeaderCell>NO Amount</DataHeaderCell>
          <DataHeaderCell>NO Cost</DataHeaderCell>
          <DataHeaderCell>NO Price</DataHeaderCell>
          <DataHeaderCell>Lower Bound</DataHeaderCell>
          <DataHeaderCell>Upper Bound</DataHeaderCell>
          <DataHeaderCell>YES-LONG Marginal Price</DataHeaderCell>
          <DataHeaderCell>NO-LONG Marginal Price</DataHeaderCell>
        </tr>
        {trades.map((trade, i) => (
          <tr key={i}>
            <TradeTime timestamp={Number(trade.tradeTime) * 1000} />
            <DataCell>{formatBalance(trade.tokenAmount)}</DataCell>
            <DataCell>{formatBalance(trade.yesTokenAmount)} {trade.yesTokenName}</DataCell>
            <DataCell>{formatBalance(trade.netYesCost)} TKN</DataCell>
            <DataCell>{trade.yesTokenPrice} TKN</DataCell>
            <DataCell>{formatBalance(trade.noTokenAmount)} {trade.noTokenName}</DataCell>
            <DataCell>{formatBalance(trade.netNoCost)} TKN</DataCell>
            <DataCell>{trade.noTokenPrice} TKN</DataCell>
            <DataCell>{trade.lowerBound}</DataCell>
            <DataCell>{trade.upperBound}</DataCell>
            <DataCell>{trade.yesLongMarginalPrice}</DataCell>
            <DataCell>{trade.noLongMarginalPrice}</DataCell>
          </tr>
        ))}
      </tbody>
    </DataTable>
  </div>
)

const DataTable = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  white-space: nowrap;
`

const DataCell = styled.td`
  border: 1px solid #e8e8e8;
  padding: 5px 8px;
  font-size: 14px;
  white-space: normal;
  overflow: hidden;
  word-wrap: break-word;
`

const DataHeaderCell = styled(DataCell)`
  font-weight: bold;
`

const TradeTime = ({ timestamp }) => (
  <React.Fragment>
    <DataCell>{moment(timestamp).format('MMM Do YYYY h:mm A')}</DataCell>
  </React.Fragment>
)


export default TradeList
