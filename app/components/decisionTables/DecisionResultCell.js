import React from 'react'
import MarketNameStyled from './MarketNameStyled'

const DecisionResultCell = ({ decisionResult }) => (
  <MarketNameStyled type={decisionResult} />
)

export default DecisionResultCell
