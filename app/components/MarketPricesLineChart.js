import React from 'react'
import _ from 'lodash'
import { Line } from 'react-chartjs-2'
import {
  YES_COLOR,
  YES_LIGHT_COLOR,
  NO_COLOR,
  NO_LIGHT_COLOR
} from '../constants/colorValues'
import formatPredictedValue from '../util/formatPredictedValue'
import { shortMonthDay } from '../util/formatDateTime'

const MarketPricesLineChart = ({
  times,
  yesPrices,
  noPrices,
  yMin,
  yMax
}) => {
  const timeLabels = _.map(times, t => shortMonthDay(t))
  const options = {
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          callback: val => formatPredictedValue(val),
          maxTicksLimit: 5,
          min: yMin,
          max: yMax
        }
      }]
    }
  }

  const data = {
    labels: timeLabels,
    datasets: [{
      label: 'YES',
      data: yesPrices,
      borderWidth: 1,
      backgroundColor: YES_LIGHT_COLOR,
      borderColor: YES_COLOR,
    }, {
      label: 'NO',
      data: noPrices,
      borderWidth: 1,
      backgroundColor: NO_LIGHT_COLOR,
      borderColor: NO_COLOR,
    }]
  }

  return (
    <Line
      data={data}
      options={options}
      width={1000}
      height={300}
    />
  )
}

export default MarketPricesLineChart
