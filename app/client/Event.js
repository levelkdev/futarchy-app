import abi from './Event.abi'
import contractFn from './contractFn'

const contractName = 'Event'

export default (aragonClient, address) => {
  const event = aragonClient.external(address, abi)

  return {
    ...event,
    isOutcomeSet: async () => contractFn(event, contractName, 'isOutcomeSet'),
    outcome: async () => contractFn(event, contractName, 'outcome')
  }
}
