import React from 'React'
import { Text, theme } from '@aragon/ui'
import decisionMarketTypes from '../constants/decisionMarketTypes'

const colorMap = {
  [decisionMarketTypes.YES]: theme.gradientStartActive,
  [decisionMarketTypes.NO]: theme.gradientEndActive
}

const nameMap = {
  [decisionMarketTypes.YES]: 'YES',
  [decisionMarketTypes.NO]: 'NO'
}

const DecisionMarketName = ({ type }) => (
  <Text color={colorMap[type]}>{nameMap[type]}</Text>
)

export default DecisionMarketName
