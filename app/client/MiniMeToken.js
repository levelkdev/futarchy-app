import abi from './MiniMeToken.abi'
import contractFn from './contractFn'

const contractName = 'miniMeToken'

export default (aragonClient, address) => {
  const miniMeToken = aragonClient.external(address, abi)

  return {
    ...miniMeToken,
    balanceOf: async account => contractFn(miniMeToken, contractName, 'balanceOf', account),
    symbol: async () => contractFn(miniMeToken, contractName, 'symbol'),
    totalSupply: async () => contractFn(miniMeToken, contractName, 'totalSupply')
  }
}
