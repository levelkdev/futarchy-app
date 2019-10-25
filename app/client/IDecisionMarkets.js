import abi from './IDecisionMarkets.abi'
import contractFn from './contractFn'

const contractName = 'IDecisionMarkets'

export default (aragonClient, address) => {
  const decisionMarkets = aragonClient.external(address, abi)

  return {
    ...decisionMarkets,
    isOutcomeSet: async () => contractFn(decisionMarkets, contractName, 'isOutcomeSet'),
    outcome: async () => contractFn(decisionMarkets, contractName, 'getOutcome'),
    markets: async () => {
      return Promise.all([
        contractFn(decisionMarkets, contractName, 'getMarketByIndex', 0),
        contractFn(decisionMarkets, contractName, 'getMarketByIndex', 1)
      ])
    }
  }
}
