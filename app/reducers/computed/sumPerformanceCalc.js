import _ from 'lodash'

export default (prop, trader, performance) => (
  _.reduce(
    _.filter(performance, { trader }),
    (result, performanceTotals) => {
      return result + performanceTotals[prop]
    },
    0
  )
)
