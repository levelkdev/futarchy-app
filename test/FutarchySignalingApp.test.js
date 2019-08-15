
// AragonOS setup contracts
const DAOFactory = artifacts.require('DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('EVMScriptRegistryFactory')
const ACL = artifacts.require('ACL')
const Kernel = artifacts.require('Kernel')
const MiniMeToken = artifacts.require('MiniMeToken')

// gnosis-pm futarchy contracts
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const CentralizedTimedOracle = artifacts.require('CentralizedTimedOracle')
const CentralizedTimedOracleFactory = artifacts.require('CentralizedTimedOracleFactory')
const FutarchySignalingOracle = artifacts.require('FutarchySignalingOracle.sol')
const FutarchySignalingOracleFactory = artifacts.require('FutarchySignalingOracleFactory.sol')
const MarketMock = artifacts.require('MarketMock.sol')
const OracleMock = artifacts.require('OracleMock.sol')
const Fixed192x64Math = artifacts.require('Fixed192x64Math')

const EventFactory = artifacts.require('EventFactory')
const Event = artifacts.require('Event')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const OutcomeToken = artifacts.require('OutcomeToken')
const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')
const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')

const StandardMarket = artifacts.require('StandardMarket')

// local contracts
const FutarchySignalingApp = artifacts.require('FutarchySignalingApp')
const DecisionLib = artifacts.require('DecisionLib.sol')
const ExecutionTarget = artifacts.require('ExecutionTarget')

const getContract = name => artifacts.require(name)
const unixTime = () => Math.round(new Date().getTime() / 1000)
const stringToHex = string => '0x' + Buffer.from(string, 'utf8').toString('hex')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const getBlockNumber = require('@aragon/test-helpers/blockNumber')(web3)
const timeTravel = require('@aragon/test-helpers/timeTravel')(web3)
const { encodeCallScript } = require('@aragon/test-helpers/evmScript')
const leftPad = require('left-pad')

const NULL_ADDRESS = '0x00'
const LOWER_BOUND = 1
const UPPER_BOUND = 100
const TRADING_PERIOD = 60 * 60 * 24 * 7
const FEE = 2000
const TIME_TO_PRICE_RESOLUTION = TRADING_PERIOD * 2
const MARKET_FUND_AMOUNT = 10 * 10 ** 18
const TWENTY = 20 * 10 ** 18
const TEN = 10 * 10 ** 18
const FIVE = 5 * 10 ** 18
const THREE = 3 * 10 ** 18
const TWO = 2 * 10 ** 18

contract('FutarchySignalingApp', (accounts) => {
  let APP_MANAGER_ROLE
  let futarchyBase
  let futarchy, token, priceOracleFactory, futarchySignalingOracleFactory, lmsrMarketMaker
  let executionTarget

  const root = accounts[0]
  const account2 = accounts[1]
  const outcomeAdmin = accounts[2]

  before(async () => {
    const fixed192x64Math = await Fixed192x64Math.new()
    await LMSRMarketMaker.link('Fixed192x64Math', fixed192x64Math.address)

    const decisionLib = await DecisionLib.new()
    await FutarchySignalingApp.link('DecisionLib', decisionLib.address);

    const kernelBase = await getContract('Kernel').new(true) // petrify immediately
    const aclBase = await getContract('ACL').new()
    const regFact = await EVMScriptRegistryFactory.new()
    daoFactory = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    futarchyBase = await FutarchySignalingApp.new()
    APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE()

    priceOracleFactory = await CentralizedTimedOracleFactory.new(root)
    lmsrMarketMaker = await LMSRMarketMaker.new()
    futarchySignalingOracleFactory = await deployFutarchyMasterCopies()
  })

  beforeEach(async () => {
    const r = await daoFactory.newDAO(root)
    const dao = await Kernel.at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
    const acl = ACL.at(await dao.acl())
    await acl.createPermission(root, dao.address, APP_MANAGER_ROLE, root, { from: root })
    const receipt = await dao.newAppInstance('0x1234', futarchyBase.address, '0x', false, { from: root })
    token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true)
    await token.generateTokens(root, 100 * 10 ** 18)
    futarchy = FutarchySignalingApp.at(receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
    const CREATE_DECISION_ROLE = await futarchy.CREATE_DECISION_ROLE()
    await acl.createPermission(root, futarchy.address, CREATE_DECISION_ROLE, root);
  })

  describe('transitionDecision()', () => {
    let futarchySignalingOracle

    beforeEach(async () => {
      await createNewDecision()
      futarchySignalingOracle = FutarchySignalingOracle.at((await futarchy.decisions(0))[0])
    })

    it('does not execute transition functionality when called externally', async () => {
      expect(await Event.at(await futarchySignalingOracle.categoricalEvent()).isOutcomeSet()).to.equal(false)
      await timeTravel(TRADING_PERIOD + 1)
      await futarchy.transitionDecision(0)
      expect(await Event.at(await futarchySignalingOracle.categoricalEvent()).isOutcomeSet()).to.equal(false)
    })

    it('does not execute transition functionality when called internally with RedeemWinnings()', async () => {
      await executeTrades(futarchySignalingOracle)

      const winningMarketIndex = 1
      const winningMarket = StandardMarketWithPriceLogger.at(await futarchySignalingOracle.markets(winningMarketIndex))
      await timeTravel(TIME_TO_PRICE_RESOLUTION + 1)
      await futarchySignalingOracle.setExternalOutcome(winningMarketIndex, {from: outcomeAdmin})
      await Event.at(await futarchySignalingOracle.categoricalEvent()).setOutcome()

      let futarchyOracle = FutarchySignalingOracle.at((await futarchy.decisions(0))[0])
      let winningIndex = (await futarchyOracle.winningMarketIndex()).toNumber()
      await CentralizedTimedOracle.at(await Event.at(await winningMarket.eventContract()).oracle()).setOutcome(85)
      await Event.at(await StandardMarketWithPriceLogger.at(await futarchySignalingOracle.markets(winningMarketIndex)).eventContract()).setOutcome()

      expect((await winningMarket.stage()).toNumber()).to.equal(1)
      await futarchy.redeemWinnings(0, { from: root })
      expect((await winningMarket.stage()).toNumber()).to.equal(1)
    })
  })

  describe('executeDecision()', () => {
    it('reverts', async () => {
      await createNewDecision()
      await executeTrades()
      await timeTravel(TRADING_PERIOD + 1)

      return assertRevert(async () => {
        await futarchy.executeDecision()
      })
    })
  })

  async function createNewDecision() {
    const script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
    const metadata = 'Give voting rights to all kitties in the world'
    await initializeFutarchy()
    await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
    await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
  }

  async function executeTrades() {
    await token.generateTokens(account2, TWENTY)
    await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (20 * 10 ** 18), {from: account2})
    await futarchy.buyMarketPositions(0, TWENTY,  [FIVE, 0], [0, FIVE], {from: root})
    await futarchy.buyMarketPositions(0, TWENTY, [THREE, 0], [0, THREE], {from: account2})
  }

  async function deployFutarchyMasterCopies() {
    const categoricalEvent = await CategoricalEvent.new()
    const scalarEvent = await ScalarEvent.new()
    const outcomeToken = await OutcomeToken.new()
    const futarchySignalingOracle = await FutarchySignalingOracle.new()
    const standardMarketWithPriceLogger = await StandardMarketWithPriceLogger.new()
    const eventFactory = await EventFactory.new(categoricalEvent.address, scalarEvent.address, outcomeToken.address)
    const standardMarketWithPriceLoggerFactory = await StandardMarketWithPriceLoggerFactory.new(standardMarketWithPriceLogger.address)
    const futarchySignalingOracleFactory = await FutarchySignalingOracleFactory.new(
      futarchySignalingOracle.address,
      eventFactory.address,
      standardMarketWithPriceLoggerFactory.address,
      outcomeAdmin
    )
    return futarchySignalingOracleFactory
  }

  async function initializeFutarchy(customParams = {}) {
    const {
      _fee = FEE,
      _tradingPeriod = TRADING_PERIOD,
      _timeToPriceResolution = TIME_TO_PRICE_RESOLUTION,
      _marketFundAmount = MARKET_FUND_AMOUNT,
      _tokenAddr = token.address,
      _futarchyOracleFactoryAddr = futarchySignalingOracleFactory.address,
      _priceOracleFactoryAddr = priceOracleFactory.address,
      _lmsrMarketMakerAddr = lmsrMarketMaker.address
    } = customParams

    await futarchy.initialize(
      _fee,
      _tradingPeriod,
      _timeToPriceResolution,
      _marketFundAmount,
      _tokenAddr,
      _futarchyOracleFactoryAddr,
      _priceOracleFactoryAddr,
      _lmsrMarketMakerAddr
    )
  }
})
