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
const FutarchyOracleFull = artifacts.require('FutarchyOracle.sol')
const FutarchyOracleFactoryFull = artifacts.require('FutarchyOracleFactory.sol')
const FutarchyOracleMock = artifacts.require('FutarchyOracleMock.sol')
const FutarchyOracleFactoryMock = artifacts.require('FutarchyOracleFactoryMock.sol')
const Fixed192x64Math = artifacts.require('Fixed192x64Math')

const EventFactory = artifacts.require('EventFactory')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const OutcomeToken = artifacts.require('OutcomeToken')
const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')
const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')

const StandardMarket = artifacts.require('StandardMarket')
const Event = artifacts.require('Event')

// local contracts
const Futarchy = artifacts.require('Futarchy.sol')
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

contract('Futarchy', (accounts) => {
  let APP_MANAGER_ROLE
  let daoFactory, futarchyBase
  let futarchy, token, priceOracleFactory, futarchyOracleFactory, lmsrMarketMaker
  let futarchyOracleFactoryFull, futarchyOracleFactoryMock
  let executionTarget

  const root = accounts[0]
  const account2 = accounts[1]

  before(async () => {
    const kernelBase = await getContract('Kernel').new(true) // petrify immediately
    const aclBase = await getContract('ACL').new()
    const regFact = await EVMScriptRegistryFactory.new()
    daoFactory = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    futarchyBase = await Futarchy.new()
    APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE()

    const fixed192x64Math = await Fixed192x64Math.new()
    await LMSRMarketMaker.link('Fixed192x64Math', fixed192x64Math.address)
    priceOracleFactory = await CentralizedTimedOracleFactory.new()
    lmsrMarketMaker = await LMSRMarketMaker.new()
    futarchyOracleFactoryFull = await deployFutarchyMasterCopies()
    futarchyOracleFactoryMock = await FutarchyOracleFactoryMock.new()
  })

  beforeEach(async () => {
    const r = await daoFactory.newDAO(root)
    const dao = await Kernel.at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
    const acl = ACL.at(await dao.acl())
    await acl.createPermission(root, dao.address, APP_MANAGER_ROLE, root, { from: root })
    const receipt = await dao.newAppInstance('0x1234', futarchyBase.address, '0x', false, { from: root })
    token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true)
    await token.generateTokens(root, 100 * 10 ** 18)
    futarchy = Futarchy.at(receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
    const CREATE_DECISION_ROLE = await futarchy.CREATE_DECISION_ROLE()
    await acl.createPermission(root, futarchy.address, CREATE_DECISION_ROLE, root);
  })

  describe('initialize()', async () => {
    beforeEach(async () => {
      await initializeFutarchy()
    })

    it('can only be called once on an instance of Futarchy', async () => {
      return assertRevert(async () => {
        await initializeFutarchy()
      })
    })

    it('sets fee', async () => {
      expect((await futarchy.fee()).toNumber()).to.equal(FEE)
    })

    it('sets tradingPeriod', async () => {
      expect((await futarchy.tradingPeriod()).toNumber()).to.equal(TRADING_PERIOD)
    })

    it('sets marketFundAmount', async () => {
      expect((await futarchy.marketFundAmount()).toNumber()).to.equal(MARKET_FUND_AMOUNT)
    })

    it('sets token', async () => {
      expect(await futarchy.token()).to.equal(token.address)
    })

    it('sets futarchyOracleFactory', async () => {
      expect(await futarchy.futarchyOracleFactory()).to.equal(futarchyOracleFactoryMock.address)
    })

    it('sets priceOracleFactory', async () => {
      expect(await futarchy.priceOracleFactory()).to.equal(priceOracleFactory.address)
    })

    it('sets lmsrMarketMaker', async () => {
      expect(await futarchy.lmsrMarketMaker()).to.equal(lmsrMarketMaker.address)
    })
  })

  describe('newDecision()', async () => {
    let script, metadata, _logs, currentBlockNumber

    beforeEach(async () => {
      await initializeFutarchy()
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
    })

    // TODO: test that it properly funds the markets.

    describe('the newly created Decision struct', async () => {
      beforeEach(async () => {
        await token.approve(futarchy.address, MARKET_FUND_AMOUNT, {from: root})
        currentBlockNumber = await getBlockNumber()
        const { logs } = await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
        _logs = logs
      })

      it('sets the correct futarchyOracle', async () => {
        expect((await futarchy.decisions(0))[0]).to.equal(_logs[0].args.futarchyOracle)
      })

      it('sets the correct startDate', async () => {
        expect((await futarchy.decisions(0))[1].toNumber()).to.be.closeTo(unixTime(), unixTime() + 5)
      })

      it('sets the correct decisionResolutionDate', async () => {
        let startDate = (await futarchy.decisions(0))[1].toNumber()
        let tradingPeriod = (await futarchy.tradingPeriod()).toNumber()
        expect((await futarchy.decisions(0))[2].toNumber()).to.equal(startDate + tradingPeriod)
      })

      it('sets the correct lowerBound', async () => {
        expect((await futarchy.decisions(0))[4].toNumber()).to.equal(LOWER_BOUND)
      })

      it('sets the correct upperBound', async () => {
        expect((await futarchy.decisions(0))[5].toNumber()).to.equal(UPPER_BOUND)
      })

      it('sets the correct resolved', async () => {
        expect((await futarchy.decisions(0))[6]).to.equal(false)
      })

      it('sets the correct passed', async () => {
        expect((await futarchy.decisions(0))[7]).to.equal(false)
      })

      it('sets executed to false', async () => {
        expect((await futarchy.decisions(0))[8]).to.equal(false)
      })

      it('sets the correct metadata', async () => {
        expect((await futarchy.decisions(0))[9]).to.equal(metadata)
      })

      it('sets the correct executionScript', async () => {
        expect((await futarchy.decisions(0))[10]).to.equal(stringToHex(script))
      })
    })

    it('emits an accurate StartDecision event', async () => {
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT, {from: root})
      const { logs } = await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
      const event = logs[0]
      expect(event.event).to.equal('StartDecision')
      expect(event.args.decisionId.toNumber()).to.equal(0)
      expect(event.args.creator).to.equal(root)
      expect(event.args.metadata).to.equal(metadata)
    })

    it('returns the decisionId number', async () => {
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT, {from: root})
      expect((await futarchy.newDecision.call(script, metadata, LOWER_BOUND, UPPER_BOUND)).toNumber()).to.equal(0)
    })

    it('increments the decisionId number every time it is called', async () => {
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT, {from: root})
      await futarchy.newDecision(script, 'abc', LOWER_BOUND, UPPER_BOUND)
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT, {from: root})
      expect((await futarchy.newDecision.call(script, metadata, LOWER_BOUND, UPPER_BOUND)).toNumber()).to.equal(1)
    })
  })

  describe('setDecision()', () => {

    beforeEach(async () => {
      // large setup not required bc no integration with full futarchyOracle here
      initializeFutarchy()
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
      futarchyOracle = FutarchyOracleMock.at((await futarchy.decisions(0))[0])
    })

    describe('when categoricalEvent is not yet resolved', () => {
      it('reverts if decisionResolutionDate has not passed yet', async () => {
        return assertRevert(async () => {
          await futarchy.setDecision(0)
        })
      })

      it('resolves the categoricalEvent', async () => {
        expect(await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).isOutcomeSet()).to.equal(false)
        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.setDecision(0)
        expect(await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).isOutcomeSet()).to.equal(true)
      })

      it('resolves the futarchyOracle', async () => {
        expect(await futarchyOracle.isOutcomeSet()).to.equal(false)
        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.setDecision(0)
        expect(await futarchyOracle.isOutcomeSet()).to.equal(true)
      })

      it('sets decision.resolved to true', async () => {
        expect((await futarchy.decisions(0))[6]).to.equal(false)
        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.setDecision(0)
        expect((await futarchy.decisions(0))[6]).to.equal(true)
      })

      it('sets passed to true if decision passed', async () => {
        await futarchyOracle.mock_setWinningMarketIndex(0)
        expect((await futarchy.decisions(0))[7]).to.equal(false)
        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.setDecision(0)
        expect((await futarchy.decisions(0))[7]).to.equal(true)
      })

      it('sets passed to false if decision failed', async () => {
        await futarchyOracle.mock_setWinningMarketIndex(1)
        expect((await futarchy.decisions(0))[7]).to.equal(false)
        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.setDecision(0)
        expect((await futarchy.decisions(0))[7]).to.equal(false)
      })
    })

    describe('when categoricalEvent is already resolved', () => {
      it('sets winning decision.passed to true if it is not set already', async () => {
        await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).setOutcome()
        await futarchyOracle.setOutcome();
        await futarchyOracle.mock_setWinningMarketIndex(0)

        expect((await futarchy.decisions(0))[7]).to.equal(false)

        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.setDecision(0)

        expect((await futarchy.decisions(0))[7]).to.equal(true)
      })

      it('keeps losing decision.passed false', async () => {
        await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).setOutcome()
        await futarchyOracle.setOutcome();
        await futarchyOracle.mock_setWinningMarketIndex(1)

        expect((await futarchy.decisions(0))[7]).to.equal(false)

        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.setDecision(0)

        expect((await futarchy.decisions(0))[7]).to.equal(false)
      })

      it('sets resolved to true if it is not set already', async () => {
        await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).setOutcome()
        await futarchyOracle.setOutcome();
        await futarchyOracle.mock_setWinningMarketIndex(0)

        expect((await futarchy.decisions(0))[6]).to.equal(false)

        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.setDecision(0)

        expect((await futarchy.decisions(0))[6]).to.equal(true)
      })
    })
  })

  describe('closeDecisionMarkets() unit tests', () => {
    let script, metadata, decisionId, futarchyOracle, keccak
    let yesMarket, noMarket, yesEvent, noEvent, yesToken, noToken, yesLongToken, yesShortToken, noLongToken, noShortToken

    beforeEach(async () => {
      // large setup not required bc no integration with full futarchyOracle here
      initializeFutarchy()
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
      futarchyOracle = FutarchyOracleMock.at((await futarchy.decisions(0))[0])
    })

    it('calls futarchyOracle.close()', async () => {
      expect(await futarchyOracle.mock_closed()).to.equal(false)
      await futarchy.closeDecisionMarkets(0)
      expect(await futarchyOracle.mock_closed()).to.equal(true)
    })

    it('transfers the full refund amount to creator when full refund is returned', async () => {
      let previousTokenBalance = (await token.balanceOf(root)).toNumber()
      await futarchy.closeDecisionMarkets(0)
      let newTokenBalance = (await token.balanceOf(root)).toNumber()
      expect(newTokenBalance - previousTokenBalance).to.equal(MARKET_FUND_AMOUNT)
    })

    it('transfers the appropriate refund to creator if refund amount is less than the full market funding', async () => {
      let lowRefundAmount = MARKET_FUND_AMOUNT - 3 * 10 ** 18
      await futarchyOracle.mock_setRefundAmount(lowRefundAmount)

      let previousTokenBalance = (await token.balanceOf(root)).toNumber()
      await futarchy.closeDecisionMarkets(0)
      let newTokenBalance = (await token.balanceOf(root)).toNumber()
      expect(newTokenBalance - previousTokenBalance).to.equal(lowRefundAmount)
    })
  })

  describe('executeDecision()', async () => {
    let script, metadata, decisionId, currentBlockNumber, futarchyOracle, exeutionTarget

    beforeEach(async () => {
      await initializeFutarchy()
      executionTarget = await ExecutionTarget.new()
      script = await encodeExecutionScript(executionTarget, futarchy)
      metadata = 'Give voting rights to all kitties in the world'

      await token.approve(futarchy.address, MARKET_FUND_AMOUNT, {from: root})
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
      decisionId = 0
      futarchyOracle = FutarchyOracleMock.at((await futarchy.decisions(0))[0])
    })

    describe('when decision is not in ready state', async () => {
      it('reverts if the decision has been executed already', async () => {
        await timeTravel(TRADING_PERIOD + 1)
        await futarchy.executeDecision(decisionId)
        return assertRevert(async () => {
          await futarchy.executeDecision(decisionId)
        })
      })

      it('reverts if the tradingPeriod has not ended yet', async () => {
        return assertRevert(async () => {
          await futarchy.executeDecision(decisionId)
        })
      })
    })

    describe('when decision is in a ready state', async () => {
      it('sets the outcome on FutarchyOracle if it is not yet set', async () => {
        await timeTravel(TRADING_PERIOD + 1)
        expect(await futarchyOracle.isOutcomeSet()).to.equal(false)
        await futarchy.executeDecision(decisionId)
        expect(await futarchyOracle.isOutcomeSet()).to.equal(true)
      })

      describe('if decision outcome is NO', async () => {
        it('reverts', async () => {
          await timeTravel(TRADING_PERIOD + 1)
          await futarchyOracle.mock_setWinningMarketIndex(1)
          return assertRevert(async () => {
            await futarchy.executeDecision(decisionId)
          })
        })
      })

      describe('if decision outcome is YES', async () => {
        beforeEach(async () => {
          await futarchyOracle.mock_setWinningMarketIndex(0)
        })

        it('runs the decision.executionScript', async () => {
          await timeTravel(TRADING_PERIOD + 1)
          expect((await executionTarget.counter()).toNumber()).to.equal(0)
          await futarchy.executeDecision(decisionId)
          expect((await executionTarget.counter()).toNumber()).to.equal(1)
        })

        it('sets decision.executed to true', async () => {
          await timeTravel(TRADING_PERIOD + 1)
          expect((await futarchy.decisions(0))[8]).to.equal(false)
          await futarchy.executeDecision(decisionId)
          expect((await futarchy.decisions(0))[8]).to.equal(true)
        })

        it('emits an ExecuteDecision event', async () => {
          await timeTravel(TRADING_PERIOD + 1)
          const { logs } = await futarchy.executeDecision(decisionId)
          expect(logs[1].event).to.equal('ExecuteDecision')
          expect(logs[1].args.decisionId.toNumber()).to.equal(0)
        })
      })
    })
  })

  describe('setPriceOutcome()', async () => {
    let script, metadata, returnValue, currentBlockNumber, price
    let futarchyOracle, scalarMarket, scalarEvent, priceOracle
    beforeEach(async () => {
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      price = 500
      initializeFutarchy({_futarchyOracleFactoryAddr: futarchyOracleFactoryFull.address})
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT, {from: root})
      currentBlockNumber = await getBlockNumber()
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)

      // Get price oracle
      futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
      scalarMarket = StandardMarket.at(await futarchyOracle.markets(0))
      scalarEvent = Event.at(await scalarMarket.eventContract())
      priceOracle = CentralizedTimedOracle.at(await scalarEvent.oracle())
    })

    describe('when resolutionDate has passed', () => {
      it('sets the correct price on the price oracle', async () => {
        await timeTravel(TIME_TO_PRICE_RESOLUTION + 1)
        await futarchy.setPriceOutcome(0, price)
        expect((await priceOracle.getOutcome()).toNumber()).to.equal(price)
      })
    })

    describe('when resolutionDate has not passed', () => {
      it('reverts', async () => {
        return assertRevert(async () => {
          await futarchy.setPriceOutcome(0, price)
        })
      })
    })
  })

  describe('buyMarketPositions()', async () => {
    let script, metadata, futarchyOracle
    let yesLongToken, yesShortToken, noLongToken, noShortToken

    beforeEach(async () => {
      initializeFutarchy({_futarchyOracleFactoryAddr: futarchyOracleFactoryFull.address})
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
      futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
    })

    it('creates new decision balances for each unique trader', async () => {
      token.generateTokens(account2, TWENTY)
      await futarchy.buyMarketPositions(0, TWENTY, [FIVE, 0], [0, FIVE], {from: root})
      expect((await rootDecisionBalances()).yesShort).to.equal(FIVE)
      expect((await account2DecisionBalances()).yesShort).to.equal(0)
      await token.approve(futarchy.address, TWENTY, {from: account2})
      await futarchy.buyMarketPositions(0, TWENTY, [THREE, 0], [0, THREE], {from: account2})
      expect((await account2DecisionBalances()).yesShort).to.equal(THREE)
    })

    it('fails trying to buy both short and long for the same outcome', async () => {
      // yes
      await assertRevert(async () => {
        await futarchy.buyMarketPositions(0, TWENTY, [FIVE, FIVE], [0, FIVE], {from: root})
      })
      // no
      await assertRevert(async () => {
        await futarchy.buyMarketPositions(0, TWENTY, [FIVE, 0], [FIVE, FIVE], {from: root})
      })
    })

    describe('when trader is trading again on the same market', async () => {
      beforeEach(async () => {
        let yesMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(0))
        let yesEvent = ScalarEvent.at(await yesMarket.eventContract())
        yesShortToken = OutcomeToken.at(await yesEvent.outcomeTokens(0))
        yesLongToken = OutcomeToken.at(await yesEvent.outcomeTokens(1))
        await futarchy.buyMarketPositions(0, TWENTY, [FIVE, 0], [0, FIVE])
      })

      it('records the correct data in the existing OutcomeTokenBalances for the trader', async () => {
        expect((await yesShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(FIVE)
        await futarchy.buyMarketPositions(0, TWENTY, [THREE, 0], [0, FIVE])
        expect((await yesShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(FIVE + THREE)
        expect((await rootDecisionBalances()).yesShort).to.equal(FIVE + THREE)
      })
    })

    describe('for yesMarket trades', async () => {
      beforeEach(async () => {
        let yesMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(0))
        let yesEvent = ScalarEvent.at(await yesMarket.eventContract())
        yesShortToken = OutcomeToken.at(await yesEvent.outcomeTokens(0))
        yesLongToken = OutcomeToken.at(await yesEvent.outcomeTokens(1))
      })

      describe('when yesPrediction is 0 (short)', async () => {
        beforeEach(async () => {
          await futarchy.buyMarketPositions(0, TWENTY, [FIVE, 0], [0, FIVE])
        })

        it('purchases the correct amount of yesLong tokens', async () => {
          expect((await yesShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(FIVE)
        })

        it('does not purchase any yesLong tokens', async () => {
          expect((await yesLongToken.balanceOf(futarchy.address)).toNumber()).to.equal(0)
        })

        it('stores the correct amount of yesShort tokens for the trader', async () => {
          expect((await rootDecisionBalances()).yesShort).to.equal(FIVE)
        })

        it('does not affect yesLong log for trader', async () => {
          expect((await rootDecisionBalances()).yesLong).to.equal(0)
        })
      })

      describe('when yesPrediction is 1 (long)', async () => {
        beforeEach(async () => {
          await futarchy.buyMarketPositions(0, TWENTY, [0, FIVE], [0, FIVE])
        })

        it('purchases the correct amount of yesLong tokens', async () => {
          expect((await yesLongToken.balanceOf(futarchy.address)).toNumber()).to.equal(FIVE)
        })

        it('does not purchase any yesShort tokens', async () => {
          expect((await yesShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(0)
        })

        it('stores the correct amount of yesLong tokens for the trader', async () => {
          expect((await rootDecisionBalances()).yesLong).to.equal(FIVE)
        })

        it('does not affect yesShort log for trader', async () => {
          expect((await rootDecisionBalances()).yesShort).to.equal(0)
        })
      })
    })

    describe('for noMarket trades', async () => {
      beforeEach(async () => {
        let noMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(1))
        let noEvent = ScalarEvent.at(await noMarket.eventContract())
        noShortToken = OutcomeToken.at(await noEvent.outcomeTokens(0))
        noLongToken = OutcomeToken.at(await noEvent.outcomeTokens(1))
      })

      describe('when noPrediction is 0 (short)', async () => {

        beforeEach(async () => {
          await futarchy.buyMarketPositions(0, TWENTY, [0, FIVE], [FIVE, 0])
        })

        it('purchases the correct amount of noShort tokens', async () => {
          expect((await noShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(FIVE)
        })

        it('does not purchase any noLong tokens', async () => {
          expect((await noLongToken.balanceOf(futarchy.address)).toNumber()).to.equal(0)
        })

        it('stores the correct amount of noShort tokens for the trader', async () => {
          expect((await rootDecisionBalances()).noShort).to.equal(FIVE)
        })

        it('does not affect noLong log for trader', async () => {
          expect((await rootDecisionBalances()).noLong).to.equal(0)
        })
      })

      describe('when noPrediction is 1 (long)', async () => {
        beforeEach(async () => {
          await futarchy.buyMarketPositions(0, TWENTY, [FIVE, 0], [0, FIVE])
        })

        it('purchases the correct amount of noLong tokens', async () => {
          expect((await noLongToken.balanceOf(futarchy.address)).toNumber()).to.equal(FIVE)
        })

        it('does not purchase any noShort tokens', async () => {
          expect((await noShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(0)
        })

        it('stores the correct amount of noLong tokens for the trader', async () => {
          expect((await rootDecisionBalances()).noLong).to.equal(FIVE)
        })

        it('does not affect noShort log for trader', async () => {
          expect((await rootDecisionBalances()).noShort).to.equal(0)
        })
      })
    })

    it('stores remaining yesMarket/noMarket collateral tokens that belong to the trader', async () => {
      expect((await rootDecisionBalances()).yesCollateral).to.equal(0)
      expect((await rootDecisionBalances()).noCollateral).to.equal(0)
      await futarchy.buyMarketPositions(0, TWENTY, [0, FIVE], [FIVE, 0])
      expect((await rootDecisionBalances()).yesCollateral).to.equal(17279035902300609000)
      expect((await rootDecisionBalances()).noCollateral).to.equal(17279035902300609000)
    })
  })

  describe('sellMarketPositions()', async () => {
    let script, metadata, decisionId, futarchyOracle, keccak
    let yesMarket, noMarket, yesEvent, noEvent, yesToken, noToken, yesLongToken, yesShortToken, noLongToken, noShortToken

    beforeEach(async () => {
      let account2 = web3.eth.accounts[1]
      await token.generateTokens(account2, 100 * 10 ** 18)
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: account2})

      initializeFutarchy({_futarchyOracleFactoryAddr: futarchyOracleFactoryFull.address})
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)

      futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
      yesMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(0))
      noMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(1))
      yesEvent = ScalarEvent.at(await yesMarket.eventContract())
      noEvent = ScalarEvent.at(await noMarket.eventContract())

      yesToken = OutcomeToken.at(await yesEvent.collateralToken())
      noToken = OutcomeToken.at(await noEvent.collateralToken())
      yesShortToken = OutcomeToken.at(await yesEvent.outcomeTokens(0))
      yesLongToken = OutcomeToken.at(await yesEvent.outcomeTokens(1))
      noShortToken = OutcomeToken.at(await noEvent.outcomeTokens(0))
      noLongToken = OutcomeToken.at(await noEvent.outcomeTokens(1))

      await futarchy.buyMarketPositions(0, TWENTY, [TWO, 0], [0, FIVE])
      await futarchy.buyMarketPositions(0, TEN, [0, THREE], [TWO, 0], {from: account2})
    })

    describe('when scalar prediction markets are open', () => {
      it('sells entire user balances of yes and no market outcome tokens for unique decision', async () => {
        let traderDecisionBalances = await futarchy.traderDecisionBalances(keccak256(root, 0))

        let traderYesShortTokenBalance = traderDecisionBalances[2].toNumber()
        let traderNoLongTokenBalance = traderDecisionBalances[5].toNumber()

        let previousYesShortTokenBalance = (await yesShortToken.balanceOf(futarchy.address)).toNumber()
        let previousNoLongTokenBalance = (await noLongToken.balanceOf(futarchy.address)).toNumber()

        await futarchy.sellMarketPositions(0, {from: root})

        let newYesShortTokenBalance = (await yesShortToken.balanceOf(futarchy.address)).toNumber()
        let newNoLongTokenBalance = (await noLongToken.balanceOf(futarchy.address)).toNumber()
        expect(newYesShortTokenBalance).to.equal(previousYesShortTokenBalance - traderYesShortTokenBalance)
        expect(newNoLongTokenBalance).to.equal(previousNoLongTokenBalance - traderNoLongTokenBalance)
      })

      it('receives yes and no market collateral tokens in exchange for selling', async () => {
        let yesCollateralNetGain = 928961991810478100 // hard-coded for now
        let noCollateralNetGain = 2538122905593782300

        let previousYesTokenBalance = (await yesToken.balanceOf(futarchy.address)).toNumber()
        let previousNoTokenBalance = (await noToken.balanceOf(futarchy.address)).toNumber()

        await futarchy.sellMarketPositions(0, {from: root})

        let newYesTokenBalance = (await yesToken.balanceOf(futarchy.address)).toNumber()
        let newNoTokenBalance = (await noToken.balanceOf(futarchy.address)).toNumber()

        expect(newYesTokenBalance).to.equal(previousYesTokenBalance + yesCollateralNetGain)
        expect(newNoTokenBalance).to.equal(previousNoTokenBalance + noCollateralNetGain)
      })

      it('stores correct updated token balances for trader for unique decision', async () => {
        let yesCollateralNetGain = 928961991810482200 // hard-coded for now
        let noCollateralNetGain = 2538122905593784300

        let previousDecisionBalances = await rootDecisionBalances()

        await futarchy.sellMarketPositions(0, {from: root})

        let newDecisionBalances = await rootDecisionBalances()

        expect(newDecisionBalances.yesCollateral).to.equal(
          previousDecisionBalances.yesCollateral + yesCollateralNetGain
        )
        expect(newDecisionBalances.noCollateral).to.equal(
          previousDecisionBalances.noCollateral + noCollateralNetGain
        )
        expect(newDecisionBalances.yesShort).to.equal(0)
        expect(newDecisionBalances.yesLong).to.equal(0)
        expect(newDecisionBalances.noShort).to.equal(0)
        expect(newDecisionBalances.noLong).to.equal(0)
      })

      it('emit a SellMarketPositions event', async () => {
        const { logs } = await futarchy.sellMarketPositions(0, {from: root})
        const event = logs[0]
        expect(event.event).to.equal('SellMarketPositions')
      })
    })

    describe('when scalar prediction markets are closed', () => {
      it('reverts', async () => {
        await timeTravel(TIME_TO_PRICE_RESOLUTION + 1)

        await futarchyOracle.setOutcome()
        await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).setOutcome()
        await futarchy.setPriceOutcome(0, 85)
        await noEvent.setOutcome()
        await futarchy.closeDecisionMarkets(0)

        return assertRevert(async () => {
          await futarchy.sellMarketPositions(0, {from: root})
        })
      })
    })

  })

  describe('redeemWinningCollateralTokens()', () => {
    beforeEach(async () => {
      let account2 = web3.eth.accounts[1]
      await token.generateTokens(account2, 100 * 10 ** 18)
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: account2})

      initializeFutarchy({_futarchyOracleFactoryAddr: futarchyOracleFactoryFull.address})
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)

      futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
      yesMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(0))
      noMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(1))
      let yesEvent = ScalarEvent.at(await yesMarket.eventContract())
      let noEvent = ScalarEvent.at(await noMarket.eventContract())

      yesToken = OutcomeToken.at(await yesEvent.collateralToken())
      noToken = OutcomeToken.at(await noEvent.collateralToken())
      yesShortToken = OutcomeToken.at(await yesEvent.outcomeTokens(0))
      yesLongToken = OutcomeToken.at(await yesEvent.outcomeTokens(1))
      noShortToken = OutcomeToken.at(await noEvent.outcomeTokens(0))
      noLongToken = OutcomeToken.at(await noEvent.outcomeTokens(1))
    })

    it('emits a RedeemWinnings event', async () => {
      await futarchy.buyMarketPositions(0, TWENTY, [TWO, 0], [0, FIVE])
      await timeTravel(TRADING_PERIOD + 1)
      await futarchyOracle.setOutcome()
      await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).setOutcome()
      const { logs } = await futarchy.redeemWinningCollateralTokens(0, {from: root})
      expect(logs[0].event).to.equal('RedeemWinningCollateralTokens')
    })

    describe('when outcome is YES', () => {
      beforeEach(async () => {
        await futarchy.buyMarketPositions(0, TWENTY, [0, TWO], [FIVE,0])
        await timeTravel(TRADING_PERIOD + 1)
        await futarchyOracle.setOutcome()
        await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).setOutcome()
      })

      it('transfers dao token amount matching trader yesCollateral balance', async () => {
        let yesCollateralBalance = (await rootDecisionBalances()).yesCollateral
        let previousTokenBalance = (await token.balanceOf(root)).toNumber()
        await futarchy.redeemWinningCollateralTokens(0, {from: root})
        let newTokenBalance = (await token.balanceOf(root)).toNumber()
        expect(newTokenBalance).to.equal(previousTokenBalance + yesCollateralBalance)
      })

      it('sets yesCollateral trader balance to 0', async () => {
        expect((await rootDecisionBalances()).yesCollateral).to.be.above(0)
        await futarchy.redeemWinningCollateralTokens(0, {from: root})
        expect((await rootDecisionBalances()).yesCollateral).to.equal(0)
      })
    })

    describe('when outcome is NO', () => {
      beforeEach(async () => {
        await futarchy.buyMarketPositions(0, TWENTY, [TWO, 0], [0, FIVE])
        await timeTravel(TRADING_PERIOD + 1)
        await futarchyOracle.setOutcome()
        await CategoricalEvent.at(await futarchyOracle.categoricalEvent()).setOutcome()
      })

      it('transfers dao token amount matching trader noCollateral balance', async () => {
        let noCollateralBalance = (await rootDecisionBalances()).noCollateral
        let previousTokenBalance = (await token.balanceOf(root)).toNumber()
        await futarchy.redeemWinningCollateralTokens(0, {from: root})
        let newTokenBalance = (await token.balanceOf(root)).toNumber()
        expect(newTokenBalance).to.equal(previousTokenBalance + noCollateralBalance)
      })

      it('sets noCollateral trader balance to 0', async () => {
        expect((await rootDecisionBalances()).noCollateral).to.be.above(0)
        await futarchy.redeemWinningCollateralTokens(0, {from: root})
        expect((await rootDecisionBalances()).noCollateral).to.equal(0)
      })
    })

    describe('when futarchyOracle is not yet set', () => {
      describe('when outcome is YES', () => {
        beforeEach(async () => {
          await futarchy.buyMarketPositions(0, TWENTY, [0, TWO], [FIVE,0])
          await timeTravel(TRADING_PERIOD + 1)
        })

        it('sets the outcome on FutarchyOracle', async () => {
          expect(await futarchyOracle.isOutcomeSet()).to.equal(false)
          await futarchy.redeemWinningCollateralTokens(0, {from: root})
          expect(await futarchyOracle.isOutcomeSet()).to.equal(true)
        })

        it('sets resolved to true in the decision struct', async () => {
          expect((await futarchy.decisions(0))[6]).to.equal(false)
          await futarchy.redeemWinningCollateralTokens(0, {from: root})
          expect((await futarchy.decisions(0))[6]).to.equal(true)
        })

        it('sets passed to true in the decision struct', async () => {
          expect((await futarchy.decisions(0))[7]).to.equal(false)
          await futarchy.redeemWinningCollateralTokens(0, {from: root})
          expect((await futarchy.decisions(0))[7]).to.equal(true)
        })
      })

      describe('when outcome is NO', () => {
        beforeEach(async () => {
          await futarchy.buyMarketPositions(0, TWENTY, [TWO, 0], [0,FIVE])
          await timeTravel(TRADING_PERIOD + 1)
        })

        it('sets the outcome on FutarchyOracle', async () => {
          expect(await futarchyOracle.isOutcomeSet()).to.equal(false)
          await futarchy.redeemWinningCollateralTokens(0, {from: root})
          expect(await futarchyOracle.isOutcomeSet()).to.equal(true)
        })

        it('sets resolved to true in the decision struct', async () => {
          expect((await futarchy.decisions(0))[6]).to.equal(false)
          await futarchy.redeemWinningCollateralTokens(0, {from: root})
          expect((await futarchy.decisions(0))[6]).to.equal(true)
        })

        it('keeps passed as false in the decision struct', async () => {
          expect((await futarchy.decisions(0))[7]).to.equal(false)
          await futarchy.redeemWinningCollateralTokens(0, {from: root})
          expect((await futarchy.decisions(0))[7]).to.equal(false)
        })
      })
    })
  })

  describe('redeemWinnings()', () => {
    beforeEach(async () => {
      initializeFutarchy({_futarchyOracleFactoryAddr: futarchyOracleFactoryFull.address})
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
      futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
      yesMarketAddr = await futarchyOracle.markets(0)
      noMarketAddr = await futarchyOracle.markets(1)

      token.generateTokens(account2, TWENTY)
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (20 * 10 ** 18), {from: account2})
      await futarchy.buyMarketPositions(0, TWENTY,  [FIVE, 0], [0, FIVE], {from: root})
      await futarchy.buyMarketPositions(0, TWENTY, [THREE, 0], [0, THREE], {from: account2})
    })

    describe('when scalar markets are not yet resolved', () => {
       beforeEach(async () => {
         timeTravel(TIME_TO_PRICE_RESOLUTION + 1)
         await futarchy.setDecision(0)
       })

      it('first calls sellMarketPositions for sender decision positions', async () => {
        const { logs } = await futarchy.redeemWinnings(0, { from: root })
        expect(logs[0].event).to.equal('SellMarketPositions')
      })

      it('calls redeemWinningCollateralTokenBalance', async () => {
        const { logs } = await futarchy.redeemWinnings(0, { from: root })
        expect(logs[1].event).to.equal('RedeemWinningCollateralTokens')
      })
    })

    describe('when scalar markets are resolved', () => {
      beforeEach(async () => {
        timeTravel(TIME_TO_PRICE_RESOLUTION + 1)
        await futarchy.setDecision(0)
        await setScalarEvent(futarchy, 0, 87)
      })

      it('transfers the correct amount of tokens to each sender', async () => {
        const rootWinnings = 21622465902300610000
        const account2Winnings = 20770371446164095000

        await futarchy.closeDecisionMarkets(0)

        const prevBalanceRoot = (await token.balanceOf(root)).toNumber()
        const prevBalanceAcct2 = (await token.balanceOf(account2)).toNumber()

        await futarchy.redeemWinnings(0, { from: account2 })
        await futarchy.redeemWinnings(0, { from: root })

        const currentBalanceRoot = (await token.balanceOf(root)).toNumber()
        const currentBalanceAcct2 = (await token.balanceOf(account2)).toNumber()


        expect(currentBalanceRoot - prevBalanceRoot).to.equal(rootWinnings)
        expect(currentBalanceAcct2 - prevBalanceAcct2).to.equal(account2Winnings)
      })

      it('sets the senders new balances to 0 for winning outcome tokens', async () => {
        let rootBalances = await rootDecisionBalances()
        let acct2Balances = await account2DecisionBalances()

        expect(rootBalances.noLong).to.not.equal(0)
        expect(acct2Balances.noLong).to.not.equal(0)

        await futarchy.closeDecisionMarkets(0)

        await futarchy.redeemWinnings(0, { from: root })
        rootBalances = await rootDecisionBalances()
        acct2Balances = await account2DecisionBalances()
        expect(rootBalances.noLong).to.equal(0)
        expect(acct2Balances.noLong).to.not.equal(0)
        //
        await futarchy.redeemWinnings(0, { from: account2 })
        rootBalances = await rootDecisionBalances()
        acct2Balances = await account2DecisionBalances()
        expect(rootBalances.noLong).to.equal(0)
        expect(acct2Balances.noLong).to.equal(0)
      })

      it('emits a RedeemScalarWinnings event', async () => {
        await futarchy.closeDecisionMarkets(0)
        const { logs } = await futarchy.redeemWinnings(0, { from: root })
        expect(logs[0].event).to.equal('RedeemScalarWinnings')
      })

      it('calls redeemWinningCollateralTokenBalance', async () => {
        await futarchy.closeDecisionMarkets(0)
        const { logs } = await futarchy.redeemWinnings(0, { from: root })
        expect(logs[1].event).to.equal('RedeemWinningCollateralTokens')
      })
    })
  })


  describe('calcMarginalPrices()', () => {
    let script, metadata, twenty, five, three, yesMarketAddr, noMarketAddr

    beforeEach(async () => {
      twenty = 20 * 10 ** 18
      five = 5 * 10 ** 18
      three = 3 * 10 ** 18
      initializeFutarchy({_futarchyOracleFactoryAddr: futarchyOracleFactoryFull.address})
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
      futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
      yesMarketAddr = await futarchyOracle.markets(0)
      noMarketAddr = await futarchyOracle.markets(1)
    })

    it('returns marginal prices for outcome tokens on YES and NO markets', async () => {
      await futarchy.buyMarketPositions(0, twenty, [five + three, 0], [0, five + three], {from: root})
      await timeTravel(1800)

      const marginalPrices = await futarchy.calcMarginalPrices(0)

      const marginalPricesFromLMSR = [
        (await lmsrMarketMaker.calcMarginalPrice(yesMarketAddr, 0)).toNumber(),
        (await lmsrMarketMaker.calcMarginalPrice(yesMarketAddr, 1)).toNumber(),
        (await lmsrMarketMaker.calcMarginalPrice(noMarketAddr, 0)).toNumber(),
        (await lmsrMarketMaker.calcMarginalPrice(noMarketAddr, 1)).toNumber()
      ]

      for(var i in marginalPrices) {
        const marginalPriceVal = marginalPrices[i].toNumber()
        expect(marginalPriceVal).to.equal(marginalPricesFromLMSR[i])
      }
    })

  })

  describe('getNetOutcomeTokensSoldForDecision()', () => {
    let script, metadata, twenty, five, three

    beforeEach(async () => {
      twenty = 20 * 10 ** 18
      five = 5 * 10 ** 18
      three = 3 * 10 ** 18
      initializeFutarchy({_futarchyOracleFactoryAddr: futarchyOracleFactoryFull.address})
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await token.approve(futarchy.address, MARKET_FUND_AMOUNT +  (40 * 10 ** 18), {from: root})
      await futarchy.newDecision(script, metadata, LOWER_BOUND, UPPER_BOUND)
      futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
      await futarchy.buyMarketPositions(0, twenty, [three, 0], [three, 0], {from: root})
      await futarchy.buyMarketPositions(0, twenty, [0, five], [0, five], {from: root})
      await timeTravel(1800)
    })

    describe('when the YES market is queried', () => {
      it('returns net outcome tokens sold for the YES market', async () => {
        // For markets, 0 is yes, and 1 is no; and for those markets' outcome tokens, 0 is short, and 1 long
        const netShortOutcomeTokensSold = (await futarchy.getNetOutcomeTokensSoldForDecision(0,0))[0].toNumber()
        const netLongOutcomeTokensSold = (await futarchy.getNetOutcomeTokensSoldForDecision(0,0))[1].toNumber()
        expect(netLongOutcomeTokensSold).to.equal(five)
        expect(netShortOutcomeTokensSold).to.equal(three)
      })
    })

    describe('when the NO market is queried', () => {
      it('returns net outcome tokens sold for the NO market', async () => {
        // For markets, 0 is yes, and 1 is no; and for those markets' outcome tokens, 0 is short, and 1 long
        const netShortOutcomeTokensSold = (await futarchy.getNetOutcomeTokensSoldForDecision(0,1))[0].toNumber()
        const netLongOutcomeTokensSold = (await futarchy.getNetOutcomeTokensSoldForDecision(0,1))[1].toNumber()
        expect(netLongOutcomeTokensSold).to.equal(five)
        expect(netShortOutcomeTokensSold).to.equal(three)
      })
    })
  })

  async function initializeFutarchy(customParams = {}) {
    const {
      _fee = FEE,
      _tradingPeriod = TRADING_PERIOD,
      _timeToPriceResolution = TIME_TO_PRICE_RESOLUTION,
      _marketFundAmount = MARKET_FUND_AMOUNT,
      _tokenAddr = token.address,
      _futarchyOracleFactoryAddr = futarchyOracleFactoryMock.address,
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

  async function setScalarEvent(futarchy, decisionId, resolvedPrice) {
    let futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(decisionId))[0])
    let winningIndex = (await futarchyOracle.winningMarketIndex()).toNumber()

    await futarchy.setPriceOutcome(decisionId, resolvedPrice)
    await Event.at(await StandardMarket.at(await futarchyOracle.markets(winningIndex)).eventContract()).setOutcome()
  }

  async function rootDecisionBalances() {
    return getTraderDecisionBalances(keccak256(root, 0))
  }

  async function account2DecisionBalances() {
    return getTraderDecisionBalances(keccak256(account2, 0))
  }

  async function getTraderDecisionBalances(decisionKey) {
    [
      yesCollateral,
      noCollateral,
      yesShort,
      yesLong,
      noShort,
      noLong
    ] = await futarchy.traderDecisionBalances(decisionKey)

    return {
      yesCollateral: yesCollateral.toNumber(),
      noCollateral: noCollateral.toNumber(),
      yesShort: yesShort.toNumber(),
      yesLong: yesLong.toNumber(),
      noShort: noShort.toNumber(),
      noLong: noLong.toNumber()
    }
  }
})

async function logTokenBalances(futarchy, addrs = []) {
  let futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
  let yesMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(0))
  let noMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(1))
  let yesEvent = ScalarEvent.at(await yesMarket.eventContract())
  let noEvent = ScalarEvent.at(await noMarket.eventContract())

  let collateralToken = MiniMeToken.at(await futarchy.token())
  let yesToken = OutcomeToken.at(await yesEvent.collateralToken())
  let noToken = OutcomeToken.at(await noEvent.collateralToken())
  let yesShortToken = OutcomeToken.at(await yesEvent.outcomeTokens(0))
  let yesLongToken = OutcomeToken.at(await yesEvent.outcomeTokens(1))
  let noShortToken = OutcomeToken.at(await noEvent.outcomeTokens(0))
  let noLongToken = OutcomeToken.at(await noEvent.outcomeTokens(1))

  console.log('futarchy balances: ')
  console.log('    collateralToken: ',(await collateralToken.balanceOf(futarchy.address)).toNumber() / 10 ** 18)
  console.log('    yesToken:      ', (await yesToken.balanceOf(futarchy.address)).toNumber() / 10 ** 18 )
  console.log('    noToken:       ', (await noToken.balanceOf(futarchy.address)).toNumber() / 10 ** 18)
  console.log('    yesLongToken:  ', (await yesLongToken.balanceOf(futarchy.address)).toNumber() / 10 ** 18)
  console.log('    yesShortToken: ', (await yesShortToken.balanceOf(futarchy.address)).toNumber() / 10 ** 18)
  console.log('    noLongToken:   ', (await noLongToken.balanceOf(futarchy.address)).toNumber() / 10 ** 18)
  console.log('    noShortToken:  ', (await noShortToken.balanceOf(futarchy.address)).toNumber() / 10 ** 18 )
  console.log('')

  for(addr of addrs) {
    console.log(`${addr} balances: `)
    console.log('    collateralToken: ',(await collateralToken.balanceOf(addr)).toNumber() / 10 ** 18)
    console.log('    yesToken:      ', (await yesToken.balanceOf(addr)).toNumber() / 10 ** 18 )
    console.log('    noToken:       ', (await noToken.balanceOf(addr)).toNumber() / 10 ** 18)
    console.log('    yesLongToken:  ', (await yesLongToken.balanceOf(addr)).toNumber() / 10 ** 18)
    console.log('    yesShortToken: ', (await yesShortToken.balanceOf(addr)).toNumber() / 10 ** 18)
    console.log('    noLongToken:   ', (await noLongToken.balanceOf(addr)).toNumber() / 10 ** 18)
    console.log('    noShortToken:  ', (await noShortToken.balanceOf(addr)).toNumber() / 10 ** 18 )
    console.log('')
  }

  console.log('\n\n\n')
}




async function deployFutarchyMasterCopies() {
  const categoricalEvent = await CategoricalEvent.new()
  const scalarEvent = await ScalarEvent.new()
  const outcomeToken = await OutcomeToken.new()
  const futarchyOracle = await FutarchyOracleFull.new()
  const standardMarketWithPriceLogger = await StandardMarketWithPriceLogger.new()
  const eventFactory = await EventFactory.new(categoricalEvent.address, scalarEvent.address, outcomeToken.address)
  const standardMarketWithPriceLoggerFactory = await StandardMarketWithPriceLoggerFactory.new(standardMarketWithPriceLogger.address)
  const futarchyOracleFactory = await FutarchyOracleFactoryFull.new(futarchyOracle.address, eventFactory.address, standardMarketWithPriceLoggerFactory.address)
  return futarchyOracleFactory
}

async function encodeExecutionScript(executionTargetParam) {
  executionTarget = executionTargetParam || await ExecutionTarget.new()
  const action = { to: executionTarget.address, calldata: executionTarget.contract.execute.getData() }
  return encodeCallScript([action])
}

function keccak256(address, decisionId) {
  return web3.sha3(address + leftPad(decisionId, 64, 0), {encoding: "hex"})
}
