import abi from './StandardMarketWithPriceLogger.abi'
import contractFn from './contractFn'

const contractName = 'standardMarketWithPriceLogger'

export default (aragonClient, address) => {
  const standardMarketWithPriceLogger = aragonClient.external(address, abi)

  return {
    ...standardMarketWithPriceLogger,
    fee: async () => contractFn(standardMarketWithPriceLogger, contractName, 'fee'),
    funding: async () => contractFn(standardMarketWithPriceLogger, contractName, 'funding'),
    averagePrice: async () => contractFn(standardMarketWithPriceLogger, contractName, 'getAvgPrice'),
    netOutcomeTokensSold: async () => Promise.all([
      contractFn(standardMarketWithPriceLogger, contractName, 'netOutcomeTokensSold', 0),
      contractFn(standardMarketWithPriceLogger, contractName, 'netOutcomeTokensSold', 1)
    ])
  }
}
