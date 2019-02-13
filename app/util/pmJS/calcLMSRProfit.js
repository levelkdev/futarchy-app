import DecimalJS from 'decimal.js'

const Decimal = DecimalJS.clone({ precision: 80, toExpPos: 9999 })

/**
 * Estimates profit from selling specified number of outcome tokens to LMSR market.Unfunded markets will be handled as a special case, returning no profit.
 * @param {number[]|string[]|BigNumber[]} opts.netOutcomeTokensSold - Amounts of net outcome tokens that have been sold by the market already. Negative amount means more have been sold to the market than sold by the market.
 * @param {number|string|BigNumber} opts.funding - The amount of funding market has
 * @param {number|string|BigNumber} opts.outcomeTokenIndex - The index of the outcome
 * @param {number|string|BigNumber} opts.outcomeTokenCount - The number of outcome tokens to sell
 * @param {number|string|BigNumber} opts.feeFactor - The fee factor. Specifying 1,000,000 corresponds to 100%, 50,000 corresponds to 5%, etc.
 * @returns {Decimal} The profit from selling outcome tokens in event collateral tokens
 * @alias Gnosis.calcLMSRProfit
 */
export default function calcLMSRProfit ({
  netOutcomeTokensSold,
  funding,
  outcomeTokenIndex,
  outcomeTokenCount,
  feeFactor
}) {
  // let [[netOutcomeTokensSold, funding, outcomeTokenIndex, outcomeTokenCount, feeFactor]] =
  //     normalizeWeb3Args(Array.from(arguments), {
  //         methodName: 'calcLMSRProfit',
  //         functionInputs: [
  //             { name: 'netOutcomeTokensSold', type: 'int256[]' },
  //             { name: 'funding', type: 'uint256' },
  //             { name: 'outcomeTokenIndex', type: 'uint8' },
  //             { name: 'outcomeTokenCount', type: 'uint256' },
  //             { name: 'feeFactor', type: 'uint24' },
  //         ],
  //         defaults: {
  //             feeFactor: 0,
  //         },
  //     })

  if(funding == 0) {
      return new Decimal(0)
  }

  outcomeTokenCount = new Decimal(outcomeTokenCount.toString())
  let b = new Decimal(funding.toString()).dividedBy(new Decimal(netOutcomeTokensSold.length).ln())

  return b.times(
      netOutcomeTokensSold.reduce((acc, numShares) =>
          acc.plus(
              new Decimal(numShares.toString())
              .dividedBy(b)
              .exp()),
          new Decimal(0)).ln()
      .minus(netOutcomeTokensSold.reduce((acc, numShares, i) =>
          acc.plus(
              new Decimal(numShares.toString())
              .minus(i === outcomeTokenIndex ? outcomeTokenCount : 0)
              .dividedBy(b)
              .exp()),
          new Decimal(0)).ln()
      )).times(new Decimal(1).minus(new Decimal(feeFactor).dividedBy(1e6)))
      .dividedBy(1+1e-9).floor()  // TODO: Standardize this 1e-9 and 1e9 in isClose of tests
                                  //       This is necessary because of rounding errors due to
                                  //       series truncation in solidity implementation.
}
