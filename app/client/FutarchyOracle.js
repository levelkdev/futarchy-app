import abi from './FutarchyOracle.abi'
import contractFn from './contractFn'

const contractName = 'futarchyOracle'

export default (aragonClient, address) => {
  const futarchyOracle = aragonClient.external(address, abi)

  return {
    ...futarchyOracle,
    markets: async () => {
      return Promise.all([
        contractFn(futarchyOracle, contractName, 'markets', 0),
        contractFn(futarchyOracle, contractName, 'markets', 1)
      ])
    }
  }
}
