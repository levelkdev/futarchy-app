const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const NULL_ADDRESS = '0x00'

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts
  } = {}
) => {
  try {
    console.log('deploying dependencies...')
    console.log('')

    const MiniMeToken = artifacts.require('MiniMeToken')
    const CentralizedOracle = artifacts.require('CentralizedOracle')
    const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
    const Fixed192x64Math = artifacts.require('Fixed192x64Math')
    const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
    const CategoricalEvent = artifacts.require('CategoricalEvent')
    const ScalarEvent = artifacts.require('ScalarEvent')
    const OutcomeToken = artifacts.require('OutcomeToken')
    const FutarchyOracle = artifacts.require('FutarchyOracle')
    const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')
    const EventFactory = artifacts.require('EventFactory')
    const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')
    const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')

    const miniMeToken = await MiniMeToken.new(
      NULL_ADDRESS,
      NULL_ADDRESS,
      0,
      'n',
      0,
      'n',
      true
    )
    console.log(`MiniMeToken instance: ${miniMeToken.address}`)

    const centralizedOracle = await CentralizedOracle.new()
    console.log(`CentralizedOracle master: ${centralizedOracle.address}`)

    const centralizedOracleFactory = await CentralizedOracleFactory.new(
      centralizedOracle.address
    )
    console.log(`CentralizedOracleFactory instance: ${centralizedOracleFactory.address}`)

    const fixed192x64Math = await Fixed192x64Math.new()
    console.log(`Fixed192x64Math instance: ${fixed192x64Math.address}`)

    await LMSRMarketMaker.link('Fixed192x64Math', fixed192x64Math.address)
    const lmsrMarketMaker = await LMSRMarketMaker.new()
    console.log(`LMSRMarketMaker instance: ${lmsrMarketMaker.address}`)
    
    const categoricalEvent = await CategoricalEvent.new()
    console.log(`CategoricalEvent master: ${categoricalEvent.address}`)

    const scalarEvent = await ScalarEvent.new()
    console.log(`ScalarEvent master: ${scalarEvent.address}`)

    const outcomeToken = await OutcomeToken.new()
    console.log(`OutcomeToken master: ${outcomeToken.address}`)

    const futarchyOracle = await FutarchyOracle.new()
    console.log(`FutarchyOracle master: ${futarchyOracle.address}`)

    const standardMarketWithPriceLogger = await StandardMarketWithPriceLogger.new()
    console.log(`StandardMarketWithPriceLogger master: ${standardMarketWithPriceLogger.address}`)

    const eventFactory = await EventFactory.new(
      categoricalEvent.address,
      scalarEvent.address,
      outcomeToken.address
    )
    console.log(`EventFactory instance: ${eventFactory.address}`)

    const standardMarketWithPriceLoggerFactory = await StandardMarketWithPriceLoggerFactory.new(
      standardMarketWithPriceLogger.address
    )
    console.log(
      `StandardMarketWithPriceLoggerFactory instance: ${standardMarketWithPriceLoggerFactory.address}`
    )

    const futarchyOracleFactory = await FutarchyOracleFactory.new(
      futarchyOracle.address,
      eventFactory.address,
      standardMarketWithPriceLoggerFactory.address
    )
    console.log(`FutarchyOracleFactory instance: ${futarchyOracleFactory.address}`)

    if (typeof truffleExecCallback === 'function') {
      truffleExecCallback()
    } else {
      return {
        miniMeTokenAddress: miniMeToken.address,
        centralizedOracleFactoryAddress: centralizedOracleFactory.address,
        lmsrMarketMakerAddress: lmsrMarketMaker.address,
        eventFactoryAddress: eventFactory.address,
        standardMarketWithPriceLoggerFactoryAddress: standardMarketWithPriceLoggerFactory.address,
        futarchyOracleFactoryAddress: futarchyOracleFactory.address
      }
    }
  } catch (err) {
    console.log('Error in scripts/deploy.js: ', err)
  }
}
