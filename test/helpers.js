// /**
//  * Estimates the number of outcome tokens which can be purchased by specified amount of collateral.
//  * @param {Number[]|string[]|BigNumber[]} opts.netOutcomeTokensSold - Amounts of net outcome tokens that have been sold. Negative amount means more have been bought than sold.
//  * @param {number|string|BigNumber} opts.funding - The amount of funding market has
//  * @param {number|string|BigNumber} opts.outcomeTokenIndex - The index of the outcome
//  * @param {number|string|BigNumber} opts.cost - The amount of collateral for buying tokens
//  * @returns {Decimal} The number of outcome tokens that can be bought
//  * @alias Gnosis.calcLMSROutcomeTokenCount
//  */
// import DecimalJS from 'decimal.js'
const DecimalJS = require('decimal.js')
let Decimal = DecimalJS.clone({ precision: 80, toExpPos: 9999 })


const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')

async function calcLMSROutcomeTokenCount (market, cost, outcomeTokenIndex) {
    // decimal.js making this reaaally messy :/

    // uint[], uint, uint
    let netOutcomeTokensSold, funding, feeFactor

    // const lmsrMarketMaker = await LMSRMarketMaker.at(await market.marketMaker())
    netOutcomeTokensSold = await market.netOutcomeTokensSold(outcomeTokenIndex)
    funding = (await market.funding()).toNumber()
    console.log('funding: ', funding)

    feeFactor = await market.fee


    cost = new Decimal(cost.toString())
    let b = new Decimal(funding.toString()).dividedBy(new Decimal(netOutcomeTokensSold.length).ln())

    return b.times(
        netOutcomeTokensSold.reduce((acc, numShares) =>
            acc.plus(
                new Decimal(numShares.toString())
                .plus(cost.dividedBy(new Decimal(1).plus(new Decimal(feeFactor).dividedBy(1e6))))
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
        .ln()).minus(netOutcomeTokensSold[outcomeTokenIndex]).floor()
}

module.exports =  { calcLMSROutcomeTokenCount };
