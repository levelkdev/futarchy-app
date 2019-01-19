const getFutarchyContract = require('../utilities/getFutarchyContract')

module.exports = async callback => {
  const ERC20 = artifacts.require('ERC20')

  try {
    const daoAddress = process.argv[6]
    if (!daoAddress) {
      throw new Error('DAO address was not provided. Script expects `npm run seed:decisions <DAO_ADDRESS>`. The DAO address can be copied from the `aragon run` output.')
    }

    console.log('creating some decisions...')
    console.log('')

    const app = await getFutarchyContract(artifacts, daoAddress)
    const token = ERC20.at(await app.token())
    const marketFundAmount = await app.marketFundAmount()

    const lowerBound = 0
    const upperBound = 1000

    const decisions = [
      { executionScript: '', metadata: 'Execute a transfer of 1,000 ETH to 0xa1b2c3...?' },
      { executionScript: '', metadata: 'Increase the minimum funding parameter to 45 TKN?' },
      { executionScript: '', metadata: 'Change the timeframe for future futarchy decisions to 30 days?' },
      { executionScript: '', metadata: 'Approve AGP proposal number 7...?' },
      { executionScript: '', metadata: 'Reject XRP from registry?' },
      { executionScript: '', metadata: 'Approve inclusion of centralized front end?' }
    ]

    for(var i = 0; i < decisions.length; i++) {
      let decision = decisions[i]
      console.log(`token.approve(${app.address}, 0)`)
      await token.approve(app.address, 0)
      console.log(`token.approve(${app.address}, ${marketFundAmount})`)
      await token.approve(app.address, marketFundAmount)
      console.log(`app.newDecision(${decision.executionScript}, ${decision.metadata}, ${lowerBound}, ${upperBound})`)
      await app.newDecision(decision.executionScript, decision.metadata, lowerBound, upperBound)
      console.log('')
    }

  } catch (err) {
    console.log('Error in scripts/seed_data/decisions.js: ', err)
  }

  callback()
}
