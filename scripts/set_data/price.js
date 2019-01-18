const getFutarchyContract = require('../seed_data/getFutarchyContract')

module.exports = async callback => {
  const FutarchyOracle = artifacts.require('FutarchyOracle')
  const StandardMarket = artifacts.require('StandardMarket')
  const Event = artifacts.require('Event')
  const CentralizedTimedOracle = artifacts.require('CentralizedTimedOracle')

  try {
    const script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
    const metadata = 'Give voting rights to all kitties in the world'

    const daoAddress = process.argv[6]
    const decisionID = process.argv[7]
    const price = process.argv[8]

    if (!daoAddress || !decisionID || !price) {
      throw new Error('The correct number of arguments was not provided. Script expects `npm run set_data:price <DAO_ADDRESS> <DECISION_ID> <PRICE_INT256>`. The DAO address can be copied from the `aragon run` output.')
    }

    console.log('setting the outcome of the price oracle...')
    console.log('')

    const app = await getFutarchyContract(artifacts, daoAddress)

    //  Grab futarchy oracle
    const futarchyOracle = FutarchyOracle.at((await app.decisions(decisionID))[0])

    // Grab first scalar market.  Either works since they both use the same price oracle.
    const scalarMarket = StandardMarket.at(await futarchyOracle.markets(0))

    // Get scalar event
    const scalarEvent = Event.at(await scalarMarket.eventContract())
    console.log('got scalarEvent: ', scalarEvent.address)
    console.log('scalarEvent isOutcomeSet: ', await scalarEvent.isOutcomeSet())

    // Get and check price oracle
    const priceOracle = CentralizedTimedOracle.at(await scalarEvent.oracle())
    const priceOracleSet = await priceOracle.isOutcomeSet()
    console.log('Price Oracle address: ', priceOracle.address)
    console.log('Price Oracle isOutcomeSet: ', await priceOracle.isOutcomeSet())
    console.log('')

    if (!priceOracleSet) {
      // Set price oracle
      console.log('setting price outcome', )
      await app.setPriceOutcome(decisionID, price)

      // Get and check price oracle again
      const priceOracleSecondCheck = CentralizedTimedOracle.at(await scalarEvent.oracle())
      console.log('Price Oracle isOutcomeSet: ', await priceOracleSecondCheck.isOutcomeSet())
      console.log('outcome that was set:', (await priceOracleSecondCheck.getOutcome()).toNumber())
    } else {
     console.log('Price Oracle has already been set! The price is:', (await priceOracle.getOutcome()).toNumber())
    }
  } catch (err) {
    console.log('Error in scripts/set_data/price.js: ', err)
  }

  callback()
}
