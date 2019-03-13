import React from 'react'
import { Line } from 'react-chartjs-2'

const MarketPricesLineChart = ({ timeLabels, yesPrices, noPrices}) => {
  const data = {
    labels: timeLabels,
    datasets: [{
      label: 'YES',
      data: yesPrices
    }, {
      label: 'NO',
      data: noPrices
    }]
  }
  return <Line data={data} />
}

export default MarketPricesLineChart
