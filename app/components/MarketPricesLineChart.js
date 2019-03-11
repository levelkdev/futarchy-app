import React from 'react'
import { Line } from 'react-chartjs-2'

const MarketPricesLineChart = ({ times, yesPrices, noPrices}) => {
  console.log('TIMES: ', times)
  const data = {
    labels: times,
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
