import abi from './ScalarEvent.abi'
import contractFn from './contractFn'

const contractName = 'ScalarEvent'

export default (aragonClient, address) => {
  const scalarEvent = aragonClient.external(address, abi)

  return {
    scalarEvent
  }
}
