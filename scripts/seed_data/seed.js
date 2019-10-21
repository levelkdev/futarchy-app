const BigNumber = require('bignumber.js')
const advanceTime = require('../utilities/advanceTime')
const getFutarchyContract = require('../utilities/getFutarchyContract')
const calcOutcomeTokenCount = require('../utilities/calcOutcomeTokenCount')

module.exports = async (callback) => {
  try {
    const ERC20 = artifacts.require('ERC20')
    const IDecisionMarkets = artifacts.require('IDecisionMarkets')
    const SettableDecisionMarkets = artifacts.require('SettableDecisionMarkets')
    const CentralizedTimedOracle = artifacts.require('CentralizedTimedOracle')
    const Market = artifacts.require('Market')
    const Event = artifacts.require('Event')

    const daoAddress = process.argv[6]
    const dataFileId = process.argv[7] || 0

    if (!daoAddress) {
      throw new Error('The correct arguments were not provided. Script expects `npm run seed <DAO_ADDRESS> [DATAFILE_ID, default=0]`. The DAO address can be copied from the `aragon run` output.')
    }

    const { accounts } = web3.eth

    console.log('seeding data...')
    console.log('')

    const app = await getFutarchyContract(artifacts, daoAddress)
    const token = ERC20.at(await app.token())
    const marketFundAmount = await app.marketFundAmount()

    const lowerBound = 0
    const upperBound = 25 * 10 ** 18

    const tradesData = require('./data/data_' + dataFileId + '.json')
    let settableDecisionMarkets, decisionMarkets, yesMarket, noMarket

    for (var j = 0; j < tradesData.length; j++) {
      const data = tradesData[j]
      const {
        decisionId,
        tokenAmount,
        from,
        yesPrediction,
        noPrediction,
        executionScript,
        metadata,
        resolvedPrice,
        outcome
      } = data
      if (typeof(decisionId) !== 'undefined') {
        const decisionMarketsAddress = (await app.decisions(decisionId))[0]
        decisionMarkets = IDecisionMarkets.at(decisionMarketsAddress)
        settableDecisionMarkets = SettableDecisionMarkets.at(decisionMarketsAddress)
        yesMarket = Market.at(await decisionMarkets.getMarketByIndex(0))
        noMarket = Market.at(await decisionMarkets.getMarketByIndex(1))
      }
      switch(data.type) {
        case 'newDecision':
          console.log(`token.approve(${app.address}, 0)`)
          await token.approve(app.address, 0)
          console.log(`token.approve(${app.address}, ${marketFundAmount})`)
          await token.approve(app.address, marketFundAmount)
          console.log(`app.newDecision(${executionScript}, ${metadata}, ${lowerBound}, ${upperBound})`)
          await app.newDecision(executionScript, metadata, lowerBound, upperBound)
          break
        case 'buy':
          const yesOutcomeIndex = yesPrediction == 'SHORT' ? 0 : 1
          const noOutcomeIndex = noPrediction == 'SHORT' ? 0 : 1
          const buyer = accounts[from]

          let tokenAmountAdjustment = tokenAmount * 0.000001

          console.log(
            `Buying YES-${yesPrediction} / NO-${noPrediction} ` +
            `on Decision ${decisionId} ` +
            `for ${tokenAmount / 10 ** 18} TKN ` +
            `+ ${tokenAmountAdjustment / 10 ** 18} extra ` +
            `from ${buyer}`
          )

          // set approval balance to 0 in case there's some approval allowance
          // hanging around
          await token.approve(app.address, 0, { from: buyer })

          // Adding some tokens to the submitted amount to account for innacuracy of calcOutcomeTokenCount.js
          // compared to the smart contracts
          const overshotTokenAmount = tokenAmount + tokenAmountAdjustment
          await token.approve(app.address, overshotTokenAmount, { from: buyer })

          let yesOutcomeTokenAmounts = [0, 0]
          let noOutcomeTokenAmounts = [0, 0]
          yesOutcomeTokenAmounts[yesOutcomeIndex] = await calcOutcomeTokenCount(
            yesMarket, new BigNumber(tokenAmount), yesOutcomeIndex
          )
          noOutcomeTokenAmounts[noOutcomeIndex] = await calcOutcomeTokenCount(
            noMarket, new BigNumber(tokenAmount), noOutcomeIndex
          )

          console.log(`app.buyMarketPositions(${decisionId}, ${overshotTokenAmount}, [${yesOutcomeTokenAmounts}], [${noOutcomeTokenAmounts}])`)
          await app.buyMarketPositions(
            decisionId,
            overshotTokenAmount,
            yesOutcomeTokenAmounts,
            noOutcomeTokenAmounts,
            { from: buyer }
          )
          break
        case 'sell':
          const seller = accounts[from]

          console.log(
            `Selling market positions ` +
            `from ${seller}`
          )

          await app.sellMarketPositions(decisionId, { from: seller })
          console.log('sold positions')
          break
        case 'setDecision':
          console.log(`Set external outcome to ${outcome} for decision ${decisionId}`)
          await settableDecisionMarkets.setExternalOutcome(outcome)
          console.log(`Call transitionDecision to set winning outcome to ${outcome}`)
          await app.transitionDecision(decisionId)
          break
        case 'setPrice':
        //   console.log(`setScalarOutcome: ${decisionId}, ${resolvedPrice}`)
        //   let futarchyOracle = FutarchyOracle.at((await app.decisions(decisionId))[0])
        //   await app.setPriceOutcome(decisionId, resolvedPrice)
          let winningEvent = Event.at(await Market.at(await decisionMarkets.getMarketByIndex(await decisionMarkets.getOutcome())).eventContract())
          let priceOracle = CentralizedTimedOracle.at((await winningEvent.oracle()))
          console.log(`Setting price to ${resolvedPrice/10**18} for decision ${decisionId}`)
          await priceOracle.setOutcome(resolvedPrice)
          console.log(`Setting outcome to resolve winning market for decision ${decisionId}`)
          await winningEvent.setOutcome()
         break
        case 'advanceTime':
          await advanceTime(web3, data.seconds)
          break
        default:
          throw new Error(`${data.type} is not a valid type`)
      }
      console.log('')
    }
  } catch (err) {
    console.log('Error in scripts/seed_data/seed.js: ', err)
  }

  callback()
}
