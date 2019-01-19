import _ from 'lodash'

const findPerformanceTotal = (performanceTotals, decisionId, trader) => {
  return _.find(performanceTotals, { decisionId, trader })
}

export default findPerformanceTotal
