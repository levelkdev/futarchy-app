import React from 'react'
import formatBalance from '../util/formatBalance'

const PerformanceSummary = ({ performance }) => (
  <div>
    <div><b>PERFORMANCE SUMMARY:</b></div>
    <br />
    {performance.map((total, i) => (
      <div key={`perf_total_${i}`}>
        <div>DECISION: <b>{total.decisionId}</b></div>
        <div>TRADER ADDR: <b>{total.trader}</b></div>
        <div>YES COST BASIS: <b>{total.yesCostBasis} TKN</b></div>
        <div>NO COST BASIS: <b>{total.noCostBasis} TKN</b></div>
        <div>YES POTENTIAL PROFIT: <b>{total.yesPotentialProfit} TKN</b></div>
        <div>NO POTENTIAL PROFIT: <b>{total.noPotentialProfit} TKN</b></div>
        <div>TOTAL POTENTIAL PROFIT: <b>{total.totalPotentialProfit} TKN</b></div>
        <div>YES GAIN/LOSS: <b>{total.yesGainLoss} TKN</b></div>
        <div>NO GAIN/LOSS: <b>{total.noGainLoss} TKN</b></div>
        <div>TOTAL GAIN/LOSS: <b>{total.totalGainLoss} TKN</b></div>
        <br /><br />
      </div>
    ))}
  </div>
)

export default PerformanceSummary
