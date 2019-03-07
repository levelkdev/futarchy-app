import { logDebug, logError } from '../util/logger'

export default (contract, contractName, functionName, ...params) => {
  return new Promise((resolve, reject) => {
    contract.call(functionName, ...params).subscribe(
      value => {
        logDebug(`${contractName}.call: ${functionName}: `, value)
        resolve(value)
      },
      err => {
        logError(`${contractName}.call: ${functionName}: Error: `, err)
        reject(err)
      }
    )
  })
}
