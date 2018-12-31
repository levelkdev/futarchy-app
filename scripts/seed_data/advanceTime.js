module.exports = async function advanceTime(web3, seconds) {
  return new Promise((resolve, reject) => {
    console.log(`advance time by ${seconds} seconds`)
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0', 
      method: 'evm_increaseTime', 
      params: [seconds], 
      id: new Date().getSeconds()
    }, (increaseTimeErr) => {
      if (increaseTimeErr) reject(increaseTimeErr)
      web3.currentProvider.sendAsync({
        jsonrpc: '2.0', 
        method: 'evm_mine', 
        params: [], 
        id: new Date().getSeconds()
      }, (mineErr) => {
        if (mineErr) reject(mineErr)
        console.log(`time advanced`)
        resolve()
      })
    })
  })
}
