import decisionMarketTypes from '../../constants/decisionMarketTypes'

const getWinningMarket = decision => {
  if (decision.resolved) {
    return decision.passed ? decisionMarketTypes.YES : decisionMarketTypes.NO
  }
}

export default getWinningMarket
