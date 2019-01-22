import web3Utils from 'web3-utils'
import leftPad from 'left-pad'

const traderDecisionHash = (traderAddress, decisionId) => {
  return web3Utils.sha3(traderAddress + leftPad(decisionId, 64, 0), {encoding: "hex"})
}

export default traderDecisionHash
