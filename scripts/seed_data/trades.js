const BigNumber = require('bignumber.js')
const advanceTime = require('../utilities/advanceTime')
const getFutarchyContract = require('../utilities/getFutarchyContract')
const calcOutcomeTokenCount = require('../utilities/calcOutcomeTokenCount')

const tokenAmountAdjustment = 1000

module.exports = async (callback) => {
  const ERC20 = artifacts.require('ERC20')
  const FutarchyOracle = artifacts.require('FutarchyOracle')
  const Market = artifacts.require('Market')

  try {
    const daoAddress = process.argv[6]
    const arg7 = process.argv[7]

    if (!daoAddress || !arg7) {
      throw new Error('The correct arguments were not provided. Script expects `npm run seed:trades <DAO_ADDRESS> <DATAFILE_ID, DATAFILE_ID, . . . >`. The DAO address can be copied from the `aragon run` output. Provide the data files at the index of the decision you want them run on.  For example, if you want to run file 3 on decision 0, and file 7 on decision 1, pass in 3,7')
    }

    const dataFileIds = arg7.split(',')
    const { accounts } = web3.eth

    console.log('executing some trades...')
    console.log('')

    const app = await getFutarchyContract(artifacts, daoAddress)
    const token = ERC20.at(await app.token())

    for (var i=0; i< dataFileIds.length; i++) {
      const decisionId = i
      const tradesData = require('./data/tradesData00' + dataFileIds[i] + '.json')

      const futarchyOracle = FutarchyOracle.at((await app.decisions(decisionId))[0])
      const yesMarket = Market.at(await futarchyOracle.markets(0))
      const noMarket = Market.at(await futarchyOracle.markets(1))

      for (var j = 0; j < tradesData.length; j++) {
        const data = tradesData[j]
        if (data.type == 'buy') {
          const { tokenAmount, from, yesPrediction, noPrediction } = data
          const yesOutcomeIndex = yesPrediction == 'SHORT' ? 0 : 1
          const noOutcomeIndex = noPrediction == 'SHORT' ? 0 : 1
          const buyer = accounts[from]

          console.log(
            `Buying YES-${yesPrediction} / NO-${noPrediction} ` +
            `for ${tokenAmount / 10 ** 18} TKN ` +
            `+ ${tokenAmountAdjustment} extra ` +
            `from ${buyer}`
          )

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
        } else if (data.type == 'advanceTime') {
          await advanceTime(web3, data.seconds)
        } else {
          throw new Error(`${data.type} is not a valid type`)
        }
        console.log('')
      }
    }

  } catch (err) {
    console.log('Error in scripts/seed_data/trades.js: ', err)
  }

  callback()
}
