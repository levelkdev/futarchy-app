const BigNumber = require('bignumber.js')
const advanceTime = require('./advanceTime')
const getFutarchyContract = require('./getFutarchyContract')
const calcOutcomeTokenCount = require('./calcOutcomeTokenCount')
const tradesData = require('./tradesData001.json')

const extraTokens = 1000

module.exports = async (callback) => {
  const ERC20 = artifacts.require('ERC20')
  const FutarchyOracle = artifacts.require('FutarchyOracle')
  const Market = artifacts.require('Market')

  try {
    const daoAddress = process.argv[6]
    if (!daoAddress) {
      throw new Error('DAO address was not provided. Script expects `npm run seed:trades <DAO_ADDRESS>`. The DAO address can be copied from the `aragon run` output.')
    }

    const { accounts } = web3.eth

    const decisionId = 0

    console.log('executing some trades...')
    console.log('')

    const app = await getFutarchyContract(artifacts, daoAddress)
    const token = ERC20.at(await app.token())
    const futarchyOracle = FutarchyOracle.at((await app.decisions(decisionId))[0])
    const yesMarket = Market.at(await futarchyOracle.markets(0))
    const noMarket = Market.at(await futarchyOracle.markets(1))

    for (var i = 0; i < tradesData.length; i++) {
      const data = tradesData[i]
      if (data.type == 'buy') {
        const { tokenAmount, from, yesPrediction, noPrediction } = data
        const yesOutcomeIndex = yesPrediction == 'SHORT' ? 0 : 1
        const noOutcomeIndex = noPrediction == 'SHORT' ? 0 : 1
        const buyer = accounts[from]

        console.log(
          `Buying YES-${yesPrediction} / NO-${noPrediction} ` +
          `for ${tokenAmount / 10 ** 18} TKN ` +
          `+ ${extraTokens} extra ` +
          `from ${buyer}`
        )

        const totalTokenAmount = tokenAmount + extraTokens

        console.log(`token.approve(${app.address}, 0) from: ${buyer}`)
        await token.approve(app.address, 0, { from: buyer })
        console.log(`token.approve(${app.address}, ${totalTokenAmount}) from: ${buyer}`)
        await token.approve(app.address, totalTokenAmount, { from: buyer })

        let yesOutcomeTokenAmounts = [0, 0]
        let noOutcomeTokenAmounts = [0, 0]
        yesOutcomeTokenAmounts[yesOutcomeIndex] = await calcOutcomeTokenCount(
          yesMarket, new BigNumber(tokenAmount), yesOutcomeIndex
        )
        noOutcomeTokenAmounts[noOutcomeIndex] = await calcOutcomeTokenCount(
          noMarket, new BigNumber(tokenAmount), noOutcomeIndex
        )

        console.log(`app.buyInMarkets(${decisionId}, ${totalTokenAmount}, [${yesOutcomeTokenAmounts}], [${noOutcomeTokenAmounts}])`)
        await app.buyInMarkets(
          decisionId,
          totalTokenAmount,
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

  } catch (err) {
    console.log('Error in scripts/seed_data/trades.js: ', err)
  }

  callback()
}
