export default async (functionName, params = []) => {
  return new Promise((resolve, reject) => {
    window.aragonClient[functionName].apply(this, params).subscribe(
      (txHash) => {
        console.log(`sendClientTx: ${functionName}: tx: ${txHash}`)
        resolve(txHash)
      },
      (err) => {
        console.error(`sendClientTx: ${functionName}: Error: `, err)
        reject(err)
      }
    )
  })
}
