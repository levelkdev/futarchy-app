export default (contract, contractName, functionName, ...params) => {
  return new Promise((resolve, reject) => {
    contract.call(functionName, ...params).subscribe(
      value => {
        console.log(`${contractName}.call: ${functionName}: `, value)
        resolve(value)
      },
      err => {
        console.error(`${contractName}.call: ${functionName}: Error: `, err)
        reject(err)
      }
    )
  })
}
