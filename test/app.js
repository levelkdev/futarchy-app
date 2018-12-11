// gnosis-pm prediction market contracts
const EventFactory = artifacts.require('EventFactory')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const OutcomeToken = artifacts.require('OutcomeToken')
const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')
const MiniMeToken = artifacts.require('MiniMeToken')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const Fixed192x64Math = artifacts.require('Fixed192x64Math')

// gnosis-pm futarchy contracts
const FutarchyOracle = artifacts.require('FutarchyOracle.sol')
const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory.sol')

// aragon contracts
const Futarchy = artifacts.require('Futarchy.sol')

const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDRESS = '0x00'


contract('Futarchy', (accounts) => {
  let futarchy, oracleAddr

  before(async () => {
    const token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true)
    const centralizedOracleMaster = await CentralizedOracle.new()
    const centralizedOracleFactory = await CentralizedOracleFactory.new(centralizedOracleMaster.address)
    const fixed192x64Math = await Fixed192x64Math.new()
    await LMSRMarketMaker.link('Fixed192x64Math', fixed192x64Math.address)
    const lmsrMarketMaker = await LMSRMarketMaker.new()
    let { logs } = await centralizedOracleFactory.createCentralizedOracle("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz")
    const futarchyOracleFactory = await deployFutarchyMasterCopies()

    futarchy = await Futarchy.new()
    oracleAddr = logs[0].args.centralizedOracle

    await futarchy.initialize(
      20,
      60 * 60 * 24 * 7,
      token.address,
      futarchyOracleFactory.address,
      oracleAddr,
      lmsrMarketMaker.address
    )
  })

  it.only('should be tested', async () => {
    await futarchy.newDecision("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz", 'give all dogs voting rights')
    expect((await futarchy.decisions(0))[4]).to.equal('give all dogs voting rights')
  })
})

async function deployFutarchyMasterCopies() {
  const categoricalEvent = await CategoricalEvent.new()
  const scalarEvent = await ScalarEvent.new()
  const outcomeToken = await OutcomeToken.new()
  const futarchyOracle = await FutarchyOracle.new()
  const standardMarketWithPriceLogger = await StandardMarketWithPriceLogger.new()
  const eventFactory = await EventFactory.new(categoricalEvent.address, scalarEvent.address, outcomeToken.address)
  const standardMarketWithPriceLoggerFactory = await StandardMarketWithPriceLoggerFactory.new(standardMarketWithPriceLogger.address)
  const futarchyOracleFactory = await FutarchyOracleFactory.new(futarchyOracle.address, eventFactory.address, standardMarketWithPriceLoggerFactory.address)
  return futarchyOracleFactory
}
