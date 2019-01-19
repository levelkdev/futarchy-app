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
    const CentralizedTimedOracle = artifacts.require('CentralizedTimedOracle')
    const CentralizedTimedOracleFactory = artifacts.require('CentralizedTimedOracleFactory')
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
      'TokenCoin',
      0,
      'TKN',
      true
    )
    console.log(`MiniMeToken instance: ${miniMeToken.address}`)

    const centralizedTimedOracleFactory = await CentralizedTimedOracleFactory.new()
    console.log(`CentralizedTimedOracleFactory instance: ${centralizedTimedOracleFactory.address}`)

    const fixed192x64Math = await Fixed192x64Math.new()
    console.log(`Fixed192x64Math instance: ${fixed192x64Math.address}`)

    await LMSRMarketMaker.link('Fixed192x64Math', fixed192x64Math.address)
    const lmsrMarketMaker = await LMSRMarketMaker.new()
    console.log(`LMSRMarketMaker instance: ${lmsrMarketMaker.address}`)

    const categoricalEventMaster = await CategoricalEvent.new()
    console.log(`CategoricalEvent master: ${categoricalEventMaster.address}`)

    const scalarEventMaster = await ScalarEvent.new()
    console.log(`ScalarEvent master: ${scalarEventMaster.address}`)

    const outcomeTokenMaster = await OutcomeToken.new()
    console.log(`OutcomeToken master: ${outcomeTokenMaster.address}`)

    const futarchyOracleMaster = await FutarchyOracle.new()
    console.log(`FutarchyOracle master: ${futarchyOracleMaster.address}`)

    const standardMarketWithPriceLoggerMaster = await StandardMarketWithPriceLogger.new()
    console.log(`StandardMarketWithPriceLogger master: ${standardMarketWithPriceLoggerMaster.address}`)

    const eventFactory = await EventFactory.new(
      categoricalEventMaster.address,
      scalarEventMaster.address,
      outcomeTokenMaster.address
    )
    console.log(`EventFactory instance: ${eventFactory.address}`)

    const standardMarketWithPriceLoggerFactory = await StandardMarketWithPriceLoggerFactory.new(
      standardMarketWithPriceLoggerMaster.address
    )
    console.log(
      `StandardMarketWithPriceLoggerFactory instance: ${standardMarketWithPriceLoggerFactory.address}`
    )

    const futarchyOracleFactory = await FutarchyOracleFactory.new(
      futarchyOracleMaster.address,
      eventFactory.address,
      standardMarketWithPriceLoggerFactory.address
    )
    console.log(`FutarchyOracleFactory instance: ${futarchyOracleFactory.address}`)

    if (typeof truffleExecCallback === 'function') {
      truffleExecCallback()
    } else {
      return {
        miniMeTokenAddress: miniMeToken.address,
        centralizedTimedOracleFactoryAddress: centralizedTimedOracleFactory.address,
        lmsrMarketMakerAddress: lmsrMarketMaker.address,
        eventFactoryAddress: eventFactory.address,
        standardMarketWithPriceLoggerFactoryAddress: standardMarketWithPriceLoggerFactory.address,
        futarchyOracleFactoryAddress: futarchyOracleFactory.address
      }
    }
  } catch (err) {
    console.log('Error in scripts/deploy_deps.js: ', err)
  }
}
