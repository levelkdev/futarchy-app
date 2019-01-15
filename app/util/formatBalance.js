import BigNumber from 'bignumber.js';

export default balance => {
  const b = new BigNumber(balance)
  const n = b.dividedBy(10 ** 18)
  const nAbs = Math.abs(n)
  if (nAbs >= 0.9999999) {
    return n.toFormat(2)
  } else if (nAbs >= 0.0001) {
    return n.toFormat(4)
  } else {
    return `< ${0.0001 * (n < 0 ? -1 : 1)}`
  }
}
