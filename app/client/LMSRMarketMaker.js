import abi from './LMSRMarketMaker.abi'
import contractFn from './contractFn'

const contractName = 'LMSRMarketMaker'

export default (aragonClient, address) => {
  const lmsrMarketMaker = aragonClient.external(address, abi)

  return {
    lmsrMarketMaker
  }
}
