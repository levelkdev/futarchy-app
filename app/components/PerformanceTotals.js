import React from 'react'
import formatBalance from '../util/formatBalance'

const PerformanceTotals = ({
  currentGainLoss, 
  realizedGainLoss,
  tokenBalance,
  tokenRisked
}) => (
  <div>
    <div>CURRENT GAIN/LOSS: {formatBalance(currentGainLoss)}</div>
    <div>REALIZED GAIN/LOSS: {formatBalance(realizedGainLoss)}</div>
    <div>TOKEN BALANCE: {formatBalance(tokenBalance)}</div>
    <div>TOKEN RISKED: {formatBalance(tokenRisked)}</div>
  </div>
)

export default PerformanceTotals
