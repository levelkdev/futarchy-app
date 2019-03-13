/**
 * Returns a summary of past trade prices, averged by time increments
 */

import _ from 'lodash'
import calcPriceFromPercentage from '../../util/calcPriceFromPercentage'
import decisionById from './decisionById'

const tradePriceHistory = ({
  decisionId,
  decisions,
  trades: allTrades,
  increment,
  now
}) => {
  let returnValues = {
    yesHistory: [],
    noHistory: []
  }

  const decision = decisionById(decisions, decisionId)
  const { lowerBound, upperBound } = decision

  const trades = _.sortBy(
    _.filter(allTrades, trade => parseInt(trade.decisionId) == parseInt(decisionId)),
    trade => parseInt(trade.tradeTime)
  )
  if (trades.length == 0) {
    return returnValues
  }
  const startTime = parseInt(decision.startDate)
  const endTime = parseInt(decision.priceResolutionDate)
  
  let timePointer = startTime
  let lastYesPriceAvg = .5
  let lastNoPriceAvg = .5

  while(timePointer < endTime) {
    let avgPrices = getAveragePricesOverRange(trades, timePointer, timePointer + increment)
    if (!avgPrices.yesPrice) avgPrices.yesPrice = lastYesPriceAvg
    else lastYesPriceAvg = avgPrices.yesPrice

    if (!avgPrices.noPrice) avgPrices.noPrice = lastNoPriceAvg
    else lastNoPriceAvg = avgPrices.noPrice

    let yesPrice = null
    let noPrice = null
    if (timePointer >= now) {
      avgPrices.yesPrice = null
      avgPrices.noPrice = null
    } else {
      yesPrice = calcPriceFromPercentage(avgPrices.yesPrice, lowerBound, upperBound)
      noPrice = calcPriceFromPercentage(avgPrices.noPrice, lowerBound, upperBound)
    }

    returnValues.yesHistory.push({
      start: timePointer,
      duration: increment,
      pricePercentage: avgPrices.yesPrice,
      price: yesPrice
    })

    returnValues.noHistory.push({
      start: timePointer,
      duration: increment,
      pricePercentage: avgPrices.noPrice,
      price: noPrice
    })

    timePointer += increment
  }

  return returnValues
}

function getAveragePricesOverRange(trades, start, end) {
  let yesPrice, noPrice
  let totalYes = 0
  let totalNo = 0

  const timeFilteredTrades = _.filter(trades, trade => (
    parseInt(trade.tradeTime) >= start && parseInt(trade.tradeTime) < end
  ))

  if (timeFilteredTrades.length > 0) {
    for (let i in timeFilteredTrades) {
      const trade = timeFilteredTrades[i]
      totalYes += trade.yesLongMarginalPrice
      totalNo += trade.noLongMarginalPrice
    }
    yesPrice = totalYes / timeFilteredTrades.length
    noPrice = totalNo / timeFilteredTrades.length
  }

  return { yesPrice, noPrice }
}

export default tradePriceHistory
