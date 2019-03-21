const web3Utils = require('web3-utils')

function toWei (val, units) {
  return web3Utils.toWei(val, units)
}

export default toWei
