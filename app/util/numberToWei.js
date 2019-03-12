import BigNumber from 'bignumber.js';

// TODO: this really should be tested
function numberToWei (val) {
  return web3.toWei(val, 'ether')
}

export default numberToWei
