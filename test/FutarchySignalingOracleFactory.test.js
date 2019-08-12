const FutarchySignalingOracleFactory = artifacts.require('FutarchySignalingOracleFactory')
const FutarchySignalingOracle = artifacts.require('FutarchySignalingOracle')
const EventFactory = artifacts.require('EventFactory')
const MarketFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')
const Market = artifacts.require('StandardMarketWithPriceLogger')
const ScalarEvent = artifacts.require('ScalarEvent')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ERC20Gnosis = artifacts.require('ERC20Gnosis')

const latestTimestamp = require('./helpers/latestTimestamp')(web3)

contract('FutarchySignalingOracleFactory', (accounts) => {
  let futarchySignalingOracleFactory
  let futarchySignalingOracleMasterCopy, eventFactory, marketFactory, outcomeAdmin
  let scalarEvent, categoricalEvent, token, market

  before(async () => {
    scalarEvent = (await ScalarEvent.new()).address
    categoricalEvent = (await CategoricalEvent.new()).address
    token = (await ERC20Gnosis.new()).address
    market = (await Market.new()).address
    futarchySignalingOracleMasterCopy = await FutarchySignalingOracle.new()
    eventFactoryAddr = (await EventFactory.new(scalarEvent, categoricalEvent, token)).address
    marketFactoryAddr = (await MarketFactory.new(market)).address
    outcomeAdmin = accounts[1]
  })

  describe('constructor()', () => {
    before(async () => {
      futarchySignalingOracleFactory = await FutarchySignalingOracleFactory.new(
        futarchySignalingOracleMasterCopy.address,
        eventFactoryAddr,
        marketFactoryAddr,
        outcomeAdmin
      )
    })

    it('sets the correct futarchySignalingOracleMasterCopy', async () => {
      expect(await futarchySignalingOracleFactory.futarchySignalingOracleMasterCopy()).to.equal(futarchySignalingOracleMasterCopy.address)
    })

    it('sets the correct evenFactory', async () => {
      expect(await futarchySignalingOracleFactory.eventFactory()).to.equal(eventFactoryAddr)
    })

    it('sets the correct marketFactory', async () => {
      expect(await futarchySignalingOracleFactory.marketFactory()).to.equal(marketFactoryAddr)
    })

    it('sets the correct outcomeAdmin', async () => {
      expect(await futarchySignalingOracleFactory.outcomeAdmin()).to.equal(outcomeAdmin)
    })
  })

  describe('createFutarchyOracle()', () => {
    it('creates a FutarchySignalingOracle with correct outcomeAdmin', async () => {
      futarchySignalingOracleFactory = await FutarchySignalingOracleFactory.new(
        futarchySignalingOracleMasterCopy.address,
        eventFactoryAddr,
        marketFactoryAddr,
        outcomeAdmin
      )

      const { logs } = await futarchySignalingOracleFactory.createFutarchyOracle(
        token,
        accounts[2],
        2,
        1,
        100,
        accounts[3],
        0,
        1500,
        (await latestTimestamp()) + 1
      )

      let futarchySignalingOracle = FutarchySignalingOracle.at(logs[0].args.futarchySignalingOracle)
      expect(await futarchySignalingOracle.outcomeAdmin()).to.equal(outcomeAdmin)
    })
  })
})
