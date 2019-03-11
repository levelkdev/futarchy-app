import BigNumber from 'bignumber.js';

// TODO: this really should be tested
function decimalToWeiInt (val) {
  return web3.toWei(val, 'ether')
}

export default decimalToWeiInt
