import _ from 'lodash'

const decisionsCount = (decisionMarkets, performance, trader, status) => {
  const decisionIds = _.map(_.filter(performance, { trader }), perfTotal => perfTotal.decisionId)
  return _.filter(decisionMarkets, decisionMarket => {
    return decisionIds.includes(decisionMarket.id) && decisionMarket.status == status
  }).length
}

export default decisionsCount
