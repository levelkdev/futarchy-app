import _ from 'lodash'

const decisions = ({
  decisionMarkets,
  performance,
  trader,
  status
}) => {
  const decisionIds = filterDecisionIds(decisionMarkets, performance, trader)
  return _.filter(decisionMarkets, decisionMarket => {
    return decisionIds.includes(decisionMarket.decisionId) && decisionMarket.status == status
  })
}

const filterDecisionIds = (decisionMarkets, performance, trader) => {
  return trader ?
    _.map(_.filter(performance, { trader }), perfTotal => perfTotal.decisionId) :
    _.map(decisionMarkets, decisionMarket => decisionMarket.decisionId)
}

export default decisions
