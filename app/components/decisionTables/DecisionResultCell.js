import React from 'react'
import { Text } from '@aragon/ui'
import MarketNameStyled from './MarketNameStyled'

const DecisionResultCell = ({ decisionResult }) => (
  <div>
    <Text size="xsmall">
      <MarketNameStyled type={decisionResult} />
    </Text>
  </div>
)

export default DecisionResultCell
