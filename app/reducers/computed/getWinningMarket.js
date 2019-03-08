import decisionStatuses from '../../constants/decisionStatuses'
import decisionMarketTypes from '../../constants/decisionMarketTypes'

const getWinningMarket = decision => {
  if (decision.status !== decisionStatuses.OPEN) {
    if (decision.resolved) {
      return decision.passed ? decisionMarketTypes.YES : decisionMarketTypes.NO
    } else if (decision.yesMarketPrice && decision.noMarketPrice) {
      return decision.yesMarketPrice > decision.noMarketPrice ?
        decisionMarketTypes.YES : decisionMarketTypes.NO
    }
  }
}

export default getWinningMarket
