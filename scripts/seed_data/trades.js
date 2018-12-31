const advanceTime = require('./advanceTime')
const getFutarchyContract = require('./getFutarchyContract')
const tradesData = require('./tradesData001.json')

module.exports = async (callback) => {
  const ERC20 = artifacts.require('ERC20')

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

    for (var i = 0; i < tradesData.length; i++) {
      const data = tradesData[i]
      if (data.type == 'buy') {
        const { tokenAmount, from, yesPrediction, noPrediction } = data
        const yesOutcome = yesPrediction == 'SHORT' ? 0 : 1
        const noOutcome = noPrediction == 'SHORT' ? 0 : 1
        const buyer = accounts[from]

        console.log(
          `Buying YES-${yesPrediction} / NO-${noPrediction} ` +
          `for ${tokenAmount / 10 ** 18} TKN ` +
          `from ${buyer}`
        )

        console.log(`token.approve(${app.address}, ${tokenAmount}) from: ${buyer}`)
        await token.approve(
          app.address,
          tokenAmount,
          { from: buyer }
        )
  
        console.log(`app.trade(${decisionId}, ${tokenAmount}, ${yesOutcome}, ${noOutcome})`)
        await app.trade(
          decisionId,
          tokenAmount,
          yesOutcome,
          noOutcome,
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
