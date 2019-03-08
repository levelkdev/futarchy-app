import React from 'react'
import { Text } from '@aragon/ui'
import GainLossPercentageDisplay from '../GainLossPercentageDisplay'

const SingleGainLossPercentageCell = ({ percentage }) => (
  <div>
    <Text size="xsmall">
      <GainLossPercentageDisplay percentage={percentage} />
    </Text>
  </div>
)

export default SingleGainLossPercentageCell
