import _ from 'lodash'

export default (prop, trader, performance, winningMarkets = {}) => (
  _.reduce(
    _.filter(performance, { trader }),
    (result, performanceTotals) => {
      let winningMarket = winningMarkets[performanceTotals.decisionId] || ''
      return result + performanceTotals[winningMarket + prop]
    },
    0
  )
)
