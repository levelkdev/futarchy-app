import _ from 'lodash'

const tradesByAccount = (account, trades) => {
  return _.filter(trades, { trader: account })
}

export default tradesByAccount
