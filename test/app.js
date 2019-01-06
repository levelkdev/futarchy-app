// AragonOS setup contracts
const DAOFactory = artifacts.require('DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('EVMScriptRegistryFactory')
const ACL = artifacts.require('ACL')
const Kernel = artifacts.require('Kernel')
const MiniMeToken = artifacts.require('MiniMeToken')

// gnosis-pm futarchy contracts
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
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

const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDRESS = '0x00'

contract('Futarchy', (accounts) => {
  let APP_MANAGER_ROLE
  let futarchyBase
  let futarchy, fee, tradingPeriod, marketFundAmount, token, priceOracleFactory, futarchyOracleFactory, lmsrMarketMaker
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
    const centralizedOracleMaster = await CentralizedOracle.new()
    fee = 2000
    tradingPeriod = 60 * 60 * 24 * 7
    marketFundAmount = 10 * 10 ** 18
    priceOracleFactory = await CentralizedOracleFactory.new(centralizedOracleMaster.address)
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
      expect((await futarchy.fee()).toNumber()).to.equal(fee)
    })

    it('sets tradingPeriod', async () => {
      expect((await futarchy.tradingPeriod()).toNumber()).to.equal(tradingPeriod)
    })

    it('sets marketFundAmount', async () => {
      expect((await futarchy.marketFundAmount()).toNumber()).to.equal(marketFundAmount)
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
        await token.approve(futarchy.address, marketFundAmount, {from: root})
        currentBlockNumber = await getBlockNumber()
        const { logs } = await futarchy.newDecision(script, metadata)
        _logs = logs
      })

      it('sets the correct futarchyOracle', async () => {
        expect((await futarchy.decisions(0))[0]).to.equal(_logs[0].args.futarchyOracle)
      })

      it('sets the correct startDate', async () => {
        expect((await futarchy.decisions(0))[1].toNumber()).to.be.closeTo(unixTime(), unixTime() + 5)
      })

      it('sets the correct tradingPeriod', async () => {
        expect((await futarchy.decisions(0))[2].toNumber()).to.equal((await futarchy.tradingPeriod()).toNumber())
      })

      it('sets the correct snapshotBlock', async () => {
        expect((await futarchy.decisions(0))[3].toNumber()).to.equal(currentBlockNumber)
      })

      it('sets executed to false', async () => {
        expect((await futarchy.decisions(0))[4]).to.equal(false)
      })

      it('sets the correct metadata', async () => {
        expect((await futarchy.decisions(0))[5]).to.equal(metadata)
      })

      it('sets the correct executionScript', async () => {
        expect((await futarchy.decisions(0))[6]).to.equal(stringToHex(script))
      })
    })

    it('emits an accurate StartDecision event', async () => {
      await token.approve(futarchy.address, marketFundAmount, {from: root})
      const { logs } = await futarchy.newDecision(script, metadata)
      const event = logs[0]
      expect(event.event).to.equal('StartDecision')
      expect(event.args.decisionId.toNumber()).to.equal(0)
      expect(event.args.creator).to.equal(root)
      expect(event.args.metadata).to.equal(metadata)
    })

    it('returns the decisionId number', async () => {
      await token.approve(futarchy.address, marketFundAmount, {from: root})
      expect((await futarchy.newDecision.call(script, metadata)).toNumber()).to.equal(0)
    })

    it('increments the decisionId number every time it is called', async () => {
      await token.approve(futarchy.address, marketFundAmount, {from: root})
      await futarchy.newDecision(script, 'abc')
      await token.approve(futarchy.address, marketFundAmount, {from: root})
      expect((await futarchy.newDecision.call(script, metadata)).toNumber()).to.equal(1)
    })
  })

  describe('getDecision()', async () => {
    let script, metadata, returnValue, currentBlockNumber
    beforeEach(async () => {
      await initializeFutarchy()
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await token.approve(futarchy.address, marketFundAmount, {from: root})
      currentBlockNumber = await getBlockNumber()
      await futarchy.newDecision(script, metadata)
      returnValue = await futarchy.getDecision(0)
    })

    it('returns the correct open', async () => {
      expect(returnValue[0]).to.equal(true)
    })

    it('returns the correct executed', async () => {
      expect(returnValue[1]).to.equal(false)
    })

    it('returns the correct startDate', async () => {
      expect(returnValue[2].toNumber()).to.be.closeTo(unixTime(), unixTime() + 5)
    })

    it('returns the correct snapshotBlock', async () => {
      expect(returnValue[3].toNumber()).to.equal(currentBlockNumber)
    })

    it('returns the correct marketPower', async () => {
      expect(returnValue[4].toNumber()).to.equal((await token.totalSupply()).toNumber())
    })

    it('returns the correct script', async () => {
      expect(returnValue[5]).to.equal(stringToHex(script))
    })
  })

  describe('executeDecision()', async () => {
    let script, metadata, decisionId, currentBlockNumber, futarchyOracle, exeutionTarget

    beforeEach(async () => {
      await initializeFutarchy()
      executionTarget = await ExecutionTarget.new()
      script = await encodeExecutionScript(executionTarget)
      metadata = 'Give voting rights to all kitties in the world'

      await token.approve(futarchy.address, marketFundAmount, {from: root})
      await futarchy.newDecision(script, metadata)
      decisionId = 0
      futarchyOracle = FutarchyOracleMock.at((await futarchy.decisions(0))[0])
    })

    describe('when decision is not in ready state', async () => {
      it('reverts if the decision has been executed already', async () => {
        await timeTravel(tradingPeriod + 1)
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
        await timeTravel(tradingPeriod + 1)
        expect(await futarchyOracle.isOutcomeSet()).to.equal(false)
        await futarchy.executeDecision(decisionId)
        expect(await futarchyOracle.isOutcomeSet()).to.equal(true)
      })

      describe('if decision outcome is NO', async () => {
        it('reverts', async () => {
          await timeTravel(tradingPeriod + 1)
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
          await timeTravel(tradingPeriod + 1)
          expect((await executionTarget.counter()).toNumber()).to.equal(0)
          await futarchy.executeDecision(decisionId)
          expect((await executionTarget.counter()).toNumber()).to.equal(1)
        })

        it('sets decision.executed to true', async () => {
          await timeTravel(tradingPeriod + 1)
          expect((await futarchy.decisions(0))[4]).to.equal(false)
          await futarchy.executeDecision(decisionId)
          expect((await futarchy.decisions(0))[4]).to.equal(true)
        })

        it('emits an ExecuteDecision event', async () => {
          await timeTravel(tradingPeriod + 1)
          const { logs } = await futarchy.executeDecision(decisionId)
          expect(logs[1].event).to.equal('ExecuteDecision')
          expect(logs[1].args.decisionId.toNumber()).to.equal(0)
        })
      })
    })
  })

  describe('buyInMarkets()', async () => {
    let script, metadata, futarchyOracle, twenty, five, three
    let yesLongToken, yesShortToken, noLongToken, noShortToken

    beforeEach(async () => {
      twenty = 20 * 10 ** 18
      five = 5 * 10 ** 18
      three = 3 * 10 ** 18
      initializeFutarchy({_futarchyOracleFactoryAddr: futarchyOracleFactoryFull.address})
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await token.approve(futarchy.address, marketFundAmount +  (40 * 10 ** 18), {from: root})
      await futarchy.newDecision(script, metadata)
      futarchyOracle = FutarchyOracleFull.at((await futarchy.decisions(0))[0])
    })

    it('creates new decision balances for each unique trader', async () => {
      token.generateTokens(account2, twenty)
      await futarchy.buyInMarkets(0, twenty, [five, 0], [0, five], {from: root})
      expect((await rootDecisionBalances()).yesShort).to.equal(five)
      expect((await account2DecisionBalances()).yesShort).to.equal(0)
      await token.approve(futarchy.address, twenty, {from: account2})
      await futarchy.buyInMarkets(0, twenty, [three, 0], [0, three], {from: account2})
      expect((await account2DecisionBalances()).yesShort).to.equal(three)
    })

    describe('when trader is trading again on the same market', async () => {
      beforeEach(async () => {
        let yesMarket = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(0))
        let yesEvent = ScalarEvent.at(await yesMarket.eventContract())
        yesShortToken = OutcomeToken.at(await yesEvent.outcomeTokens(0))
        yesLongToken = OutcomeToken.at(await yesEvent.outcomeTokens(1))
        await futarchy.buyInMarkets(0, twenty, [five, 0], [0, five])
      })

      it('records the correct data in the existing OutcomeTokenBalances for the trader', async () => {
        expect((await yesShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(five)
        await futarchy.buyInMarkets(0, twenty, [three, 0], [0, five])
        expect((await yesShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(five + three)
        expect((await rootDecisionBalances()).yesShort).to.equal(five + three)
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
          await futarchy.buyInMarkets(0, twenty, [five, 0], [0, five])
        })

        it('purchases the correct amount of yesLong tokens', async () => {
          expect((await yesShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(five)
        })

        it('does not purchase any yesLong tokens', async () => {
          expect((await yesLongToken.balanceOf(futarchy.address)).toNumber()).to.equal(0)
        })

        it('stores the correct amount of yesShort tokens for the trader', async () => {
          expect((await rootDecisionBalances()).yesShort).to.equal(five)
        })

        it('does not affect yesLong log for trader', async () => {
          expect((await rootDecisionBalances()).yesLong).to.equal(0)
        })
      })

      describe('when yesPrediction is 1 (long)', async () => {
        beforeEach(async () => {
          await futarchy.buyInMarkets(0, twenty, [0, five], [0, five])
        })

        it('purchases the correct amount of yesLong tokens', async () => {
          expect((await yesLongToken.balanceOf(futarchy.address)).toNumber()).to.equal(five)
        })

        it('does not purchase any yesShort tokens', async () => {
          expect((await yesShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(0)
        })

        it('stores the correct amount of yesLong tokens for the trader', async () => {
          expect((await rootDecisionBalances()).yesLong).to.equal(five)
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
          await futarchy.buyInMarkets(0, twenty, [0, five], [five, 0])
        })

        it('purchases the correct amount of noShort tokens', async () => {
          expect((await noShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(five)
        })

        it('does not purchase any noLong tokens', async () => {
          expect((await noLongToken.balanceOf(futarchy.address)).toNumber()).to.equal(0)
        })

        it('stores the correct amount of noShort tokens for the trader', async () => {
          expect((await rootDecisionBalances()).noShort).to.equal(five)
        })

        it('does not affect noLong log for trader', async () => {
          expect((await rootDecisionBalances()).noLong).to.equal(0)
        })
      })

      describe('when noPrediction is 1 (long)', async () => {
        beforeEach(async () => {
          await futarchy.buyInMarkets(0, twenty, [0, five], [0, five])
        })

        it('purchases the correct amount of noLong tokens', async () => {
          expect((await noLongToken.balanceOf(futarchy.address)).toNumber()).to.equal(five)
        })

        it('does not purchase any noShort tokens', async () => {
          expect((await noShortToken.balanceOf(futarchy.address)).toNumber()).to.equal(0)
        })

        it('stores the correct amount of noLong tokens for the trader', async () => {
          expect((await rootDecisionBalances()).noLong).to.equal(five)
        })

        it('does not affect noShort log for trader', async () => {
          expect((await rootDecisionBalances()).noShort).to.equal(0)
        })
      })
    })

    it('stores remaining yesMarket/noMarket collateral tokens that belong to the trader', async () => {
      expect((await rootDecisionBalances()).yesCollateral).to.equal(0)
      expect((await rootDecisionBalances()).noCollateral).to.equal(0)
      await futarchy.buyInMarkets(0, twenty, [0, five], [five, 0])
      expect((await rootDecisionBalances()).yesCollateral).to.equal(17279035902300609000)
      expect((await rootDecisionBalances()).noCollateral).to.equal(17279035902300609000)
    })
  })

  async function initializeFutarchy(customParams = {}) {
    const {
      _fee = fee,
      _tradingPeriod = tradingPeriod,
      _marketFundAmount = marketFundAmount,
      _tokenAddr = token.address,
      _futarchyOracleFactoryAddr = futarchyOracleFactoryMock.address,
      _priceOracleFactoryAddr = priceOracleFactory.address,
      _lmsrMarketMakerAddr = lmsrMarketMaker.address
    } = customParams

    await futarchy.initialize(
      _fee,
      _tradingPeriod,
      _marketFundAmount,
      _tokenAddr,
      _futarchyOracleFactoryAddr,
      _priceOracleFactoryAddr,
      _lmsrMarketMakerAddr
    )
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
