import _ from 'lodash'

const tradePriceHistory = ({ decisionId, trades: allTrades, increment, now }) => {
  let returnValues = {
    yesHistory: [],
    noHistory: [],
    timeRange: { lower: null, upper: null }
  }
  const trades = _.sortBy(
    _.filter(allTrades, trade => parseInt(trade.decisionId) == parseInt(decisionId)),
    trade => parseInt(trade.tradeTime)
  )
  if (trades.length == 0) {
    return returnValues
  }
  const firstTradeTime = parseInt(trades[0].tradeTime)

  returnValues.timeRange.lower = firstTradeTime
  returnValues.timeRange.upper = now
  
  let timePointer = firstTradeTime
  let lastYesPriceAvg = .5
  let lastNoPriceAvg = .5

  while(timePointer <= now) {
    let avgPrices = getAveragePricesOverRange(trades, timePointer, timePointer + increment)
    if (!avgPrices.yesPrice) avgPrices.yesPrice = lastYesPriceAvg
    else lastYesPriceAvg = avgPrices.yesPrice

    if (!avgPrices.noPrice) avgPrices.noPrice = lastNoPriceAvg
    else lastNoPriceAvg = avgPrices.noPrice

    const nextPointer = timePointer + increment

    const timeRange = {
      lower: timePointer,
      upper: nextPointer > now ? now : nextPointer - 1
    }

    returnValues.yesHistory.push({
      timeRange,
      price: avgPrices.yesPrice
    })

    returnValues.noHistory.push({
      timeRange,
      price: avgPrices.noPrice
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
