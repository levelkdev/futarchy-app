import _ from 'lodash'

const decisionBalancesById = (decisionBalances, decisionId) => {
  return _.find(decisionBalances, { decisionId })
}

export default decisionBalancesById
