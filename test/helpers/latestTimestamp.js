module.exports = web3 => async function latestTimestamp() {
  const getBlockNumber = require('@aragon/test-helpers/blockNumber')(web3)
  return web3.eth.getBlock(await getBlockNumber()).timestamp
}
