import React from 'react'
import formatBalance from '../util/formatBalance'

const PerformanceTotals = ({
  currentGainLoss, 
  realizedGainLoss,
  tokenBalance,
  tokenRisked
}) => (
  <div>
    <div>CURRENT GAIN/LOSS: {formatBalance(currentGainLoss)} TKN</div>
    <div>REALIZED GAIN/LOSS: {formatBalance(realizedGainLoss)} TKN</div>
    <div>TOKEN BALANCE: {formatBalance(tokenBalance)} TKN</div>
    <div>TOKEN RISKED: {formatBalance(tokenRisked)} TKN</div>
  </div>
)

export default PerformanceTotals
