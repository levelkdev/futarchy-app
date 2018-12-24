import BigNumber from 'bignumber.js';

export default balance => {
  const b = new BigNumber(balance)
  return b.dividedBy(10 ** 18).toFormat(0)
}
