import decisionMarketTypes from '../../constants/decisionMarketTypes'

const getWinningMarket = decision => {
  if (decision.resolved) {
    return decision.passed ? decisionMarketTypes.YES : decisionMarketTypes.NO
  } else if (decision.yesMarketAveragePricePercentage && decision.noMarketAveragePricePercentage) {
    return decision.yesMarketAveragePricePercentage > decision.noMarketAveragePricePercentage ?
      decisionMarketTypes.YES : decisionMarketTypes.NO
  }
}

export default getWinningMarket
