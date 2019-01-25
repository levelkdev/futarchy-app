import React from 'react'
import { LineChart } from '@aragon/ui'

const MarketPricesLineChart = ({ yesPrices, noPrices}) => {
  const lines = [yesPrices, noPrices]
  return (
    <LineChart lines={lines} />
  )
}

export default MarketPricesLineChart
