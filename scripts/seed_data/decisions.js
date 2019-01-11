const getFutarchyContract = require('./getFutarchyContract')

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

    const decisions = [
      { executionScript: '', metadata: 'Execute a transfer of 1,000 ETH to 0xa1b2c3...?' },
      { executionScript: '', metadata: 'Increase the minimum funding parameter to 45 TKN?' },
      { executionScript: '', metadata: 'Change the timeframe for future futarchy decisions to 30 days?' }
    ]

    for(var i = 0; i < decisions.length; i++) {
      let decision = decisions[i]
      console.log(`token.approve(${app.address}, ${marketFundAmount})`)
      await token.approve(app.address, marketFundAmount)
      console.log(`app.newDecision(${decision.executionScript}, ${decision.metadata})`)
      await app.newDecision(decision.executionScript, decision.metadata)
      console.log('')
    }

  } catch (err) {
    console.log('Error in scripts/seed_data/decisions.js: ', err)
  }

  callback()
}
