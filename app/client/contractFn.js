import { logDebug, logError } from '../util/logger'

export default (contract, contractName, functionName, ...params) => {
  return new Promise((resolve, reject) => {
    contract[functionName].call(this, ...params).subscribe(
      (txHash) => {
        logDebug(`${contractName}: ${functionName}: tx: ${txHash}`)
        resolve(txHash)
      },
      (err) => {
        logError(`${contractName}: ${functionName}: Error: `, err)
        reject(err)
      }
    )
  })
}
