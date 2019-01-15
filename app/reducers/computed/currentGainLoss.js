import _ from 'lodash'

const currentGainLoss = (trader, performance) => {
  return _.reduce(
    _.filter(performance, { trader }),
    (result, performanceTotals) => {
      return result + performanceTotals.totalGainLoss
    },
    0
  )
}

export default currentGainLoss
