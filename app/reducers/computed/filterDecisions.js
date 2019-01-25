import _ from 'lodash'

const decisionsCount = (decisionMarkets, performance, trader, status) => {
  const decisionIds = _.map(_.filter(performance, { trader }), perfTotal => perfTotal.decisionId)
  return _.filter(decisionMarkets, decisionMarket => {
    return decisionIds.includes(decisionMarket.decisionId) && decisionMarket.status == status
  })
}

export default decisionsCount
