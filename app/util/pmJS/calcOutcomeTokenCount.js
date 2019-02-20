import DecimalJS from 'decimal.js'

let Decimal = DecimalJS.clone({ precision: 80, toExpPos: 9999 })

/**
 * Estimates the number of outcome tokens which can be purchased by specified amount of collateral.
 * @param {Number[]|string[]|BigNumber[]} opts.netOutcomeTokensSold - Amounts of net outcome tokens that have been sold. Negative amount means more have been bought than sold.
 * @param {number|string|BigNumber} opts.funding - The amount of funding market has
 * @param {number|string|BigNumber} opts.outcomeTokenIndex - The index of the outcome
 * @param {number|string|BigNumber} opts.cost - The amount of collateral for buying tokens
 * @param {number|string|BigNumber} opts.feeFactor - The fee factor. Specifying 1,000,000 corresponds to 100%, 50,000 corresponds to 5%, etc.
 * @returns {Decimal} The number of outcome tokens that can be bought
 */
const calcOutcomeTokenCount = ({
    netOutcomeTokensSold,
    funding,
    outcomeTokenIndex,
    cost,
    feeFactor
}) => {
    cost = new Decimal(cost.toString())
    let b = new Decimal(funding.toString()).dividedBy(new Decimal(netOutcomeTokensSold.length).ln())
    
    return b.times(
        netOutcomeTokensSold.reduce((acc, numShares) =>
            acc.plus(
                new Decimal(numShares.toString())
                .plus(cost.dividedBy(new Decimal(1).plus(new Decimal(feeFactor.toString()).dividedBy(1e6))))
                .dividedBy(b)
                .exp()),
            new Decimal(0))
        .minus(netOutcomeTokensSold.reduce((acc, numShares, i) =>
            i === outcomeTokenIndex ? acc
            : acc.plus(
                new Decimal(numShares.toString())
                .dividedBy(b)
                .exp()),
            new Decimal(0)))
        .ln()).minus(new Decimal(netOutcomeTokensSold[outcomeTokenIndex].toString())).floor()
}

export default calcOutcomeTokenCount
