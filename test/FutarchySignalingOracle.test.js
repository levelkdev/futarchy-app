const FutarchySignalingOracleProxy = artifacts.require('FutarchySignalingOracleProxy')
const FutarchySignalingOracle = artifacts.require('FutarchySignalingOracle')
const EventFactory = artifacts.require('EventFactory')
const MarketFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')
const Market = artifacts.require('StandardMarketWithPriceLogger')
const ScalarEvent = artifacts.require('ScalarEvent')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ERC20Gnosis = artifacts.require('ERC20Gnosis')

const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const latestTimestamp = require('./helpers/latestTimestamp')(web3)
const timeTravel = require('@aragon/test-helpers/timeTravel')(web3)

contract('FutarchySignalingOracle', (accounts) => {
  let futarchySignalingOracle
  let futarchySignalingOracleMasterCopyAddr, eventFactory, marketFactory, outcomeAdmin
  let scalarEvent, categoricalEvent, tokenAddr, market

  before(async () => {
    await latestTimestamp()
    scalarEvent = (await ScalarEvent.new()).address
    categoricalEvent = (await CategoricalEvent.new()).address
    tokenAddr = (await ERC20Gnosis.new()).address
    market = (await Market.new()).address
    futarchySignalingOracleMasterCopyAddr = (await FutarchySignalingOracle.new()).address
    eventFactoryAddr = (await EventFactory.new(scalarEvent, categoricalEvent, tokenAddr)).address
    marketFactoryAddr = (await MarketFactory.new(market)).address
    outcomeAdmin = accounts[1]
  })

  describe('setExternalOutcome()', () => {
    beforeEach(async () => {
      let futarchySignalingOracleProxy = await FutarchySignalingOracleProxy.new(
        outcomeAdmin,
        futarchySignalingOracleMasterCopyAddr,
        accounts[0],
        eventFactoryAddr,
        tokenAddr,
        accounts[2],
        2,
        0,
        100,
        marketFactoryAddr,
        accounts[3],
        0,
        1500,
        (await latestTimestamp()) + 1
      )
      futarchySignalingOracle = FutarchySignalingOracle.at(futarchySignalingOracleProxy.address)
    })

    it('sets the correct winningMarketIndex if outcome is 0', async () => {
      await timeTravel(1500 + 2)
      await futarchySignalingOracle.setExternalOutcome(0, {from: outcomeAdmin})
      expect((await futarchySignalingOracle.getOutcome()).toNumber()).to.equal(0)
    })

    it('sets the correct winningMarketIndex if outcome is 1', async () => {
      await timeTravel(1500 + 2)
      await futarchySignalingOracle.setExternalOutcome(1, {from: outcomeAdmin})
      expect((await futarchySignalingOracle.getOutcome()).toNumber()).to.equal(1)
    })

    it('sets isSet to true', async () => {
      await timeTravel(1500 + 2)
      expect(await futarchySignalingOracle.isOutcomeSet()).to.equal(false)
      await futarchySignalingOracle.setExternalOutcome(1, {from: outcomeAdmin})
      expect(await futarchySignalingOracle.isOutcomeSet()).to.equal(true)
    })

    it('reverts if called by account other than outcomeAdmin', async () => {
      await timeTravel(1500 + 1)
      return assertRevert(async () => {
        await futarchySignalingOracle.setExternalOutcome(1)
      })
    })

    it('reverts if called more than once', async () => {
      await timeTravel(1500 + 2)
      await futarchySignalingOracle.setExternalOutcome(1, {from: outcomeAdmin})
      return assertRevert(async () => {
        await futarchySignalingOracle.setExternalOutcome(1, {from: outcomeAdmin})
      })
    })

    it('reverts if trading period is not over yet', async () => {
      return assertRevert(async () => {
        await futarchySignalingOracle.setExternalOutcome(1, {from: outcomeAdmin})
      })
    })

    it('reverts if outcome is greater than 1', async () => {
      await timeTravel(1500 + 2)
      return assertRevert(async () => {
        await futarchySignalingOracle.setExternalOutcome(2, {from: outcomeAdmin})
      })
    })
  })

  describe('execute()', () => {
    it('reverts', async () => {
      let futarchySignalingOracleProxy = await FutarchySignalingOracleProxy.new(
        outcomeAdmin,
        futarchySignalingOracleMasterCopyAddr,
        accounts[0],
        eventFactoryAddr,
        tokenAddr,
        accounts[2],
        2,
        0,
        100,
        marketFactoryAddr,
        accounts[3],
        0,
        1500,
        // (new Date()).getTime() / 1000
        (await latestTimestamp()) + 1
      )
      futarchySignalingOracle = FutarchySignalingOracle.at(futarchySignalingOracleProxy.address)

      return assertRevert(async () => {
        await futarchySignalingOracle.setOutcome()
      })
    })
  })
})
