const web3Utils = require('web3-utils')

function toWei (val, units) {
  if (val === '' || typeof(val) === 'undefined' || val === null) {
    val = '0'
  }
  return web3Utils.toWei(val, units)
}

export default toWei
