import _ from 'lodash'

const performanceByIdAndTrader = (decisions, decisionId, trader) => {
  return _.find(decisions, { decisionId, trader })
}

export default performanceByIdAndTrader
