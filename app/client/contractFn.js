export default (contract, contractName, functionName, ...params) => {
  return new Promise((resolve, reject) => {
    contract[functionName].call(this, ...params).subscribe(
      (txHash) => {
        console.log(`${contractName}: ${functionName}: tx: ${txHash}`)
        resolve(txHash)
      },
      (err) => {
        console.error(`${contractName}: ${functionName}: Error: `, err)
        reject(err)
      }
    )
  })
}
