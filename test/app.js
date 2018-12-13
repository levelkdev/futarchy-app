// AragonOS setup contracts
const DAOFactory = artifacts.require('DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('EVMScriptRegistryFactory')
const ACL = artifacts.require('ACL')
const Kernel = artifacts.require('Kernel')

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

const getContract = name => artifacts.require(name)
const unixTime = () => Math.round(new Date().getTime() / 1000)
const stringToHex = string => '0x' + Buffer.from(string, 'utf8').toString('hex')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const getBlockNumber = require('@aragon/test-helpers/blockNumber')(web3)
const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDRESS = '0x00'

contract('Futarchy', (accounts) => {
  let APP_MANAGER_ROLE
  let futarchyBase, daoFact
  let centralizedOracleFactory
  let futarchy, fee, tradingPeriod, token, priceResolutionOracle, futarchyOracleFactory, lmsrMarketMaker

  const root = accounts[0]

  before(async () => {
    const kernelBase = await getContract('Kernel').new(true) // petrify immediately
    const aclBase = await getContract('ACL').new()
    const regFact = await EVMScriptRegistryFactory.new()
    daoFactory = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    futarchyBase = await Futarchy.new()
    APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE()

    const centralizedOracleMaster = await CentralizedOracle.new()
    const fixed192x64Math = await Fixed192x64Math.new()
    await LMSRMarketMaker.link('Fixed192x64Math', fixed192x64Math.address)

    fee = 20
    tradingPeriod = 60 * 60 * 24 * 7
    centralizedOracleFactory = await CentralizedOracleFactory.new(centralizedOracleMaster.address)
    lmsrMarketMaker = await LMSRMarketMaker.new()
    futarchyOracleFactory = await deployFutarchyMasterCopies()
  })

  beforeEach(async () => {
    const r = await daoFactory.newDAO(root)
    const dao = await Kernel.at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
    const acl = ACL.at(await dao.acl())
    await acl.createPermission(root, dao.address, APP_MANAGER_ROLE, root, { from: root })
    const receipt = await dao.newAppInstance('0x1234', futarchyBase.address)
    const { logs } = await centralizedOracleFactory.createCentralizedOracle("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz")
    token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true)
    priceResolutionOracle = await CentralizedOracle.at(logs[0].args.centralizedOracle)
    futarchy = Futarchy.at(receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
})

  describe('initialize()', async () => {
    beforeEach(async () => {
      await futarchy.initialize(
        fee,
        tradingPeriod,
        token.address,
        futarchyOracleFactory.address,
        priceResolutionOracle.address,
        lmsrMarketMaker.address
      )
    })

    it('can only be called once on an instance of Futarchy', async () => {
      return assertRevert(async () => {
        await futarchy.initialize(
          fee,
          tradingPeriod,
          token.address,
          futarchyOracleFactory.address,
          priceResolutionOracle.address,
          lmsrMarketMaker.address
        )
      })
    })

    it('sets fee', async () => {
      expect((await futarchy.fee()).toNumber()).to.equal(fee)
    })

    it('sets tradingPeriod', async () => {
      expect((await futarchy.tradingPeriod()).toNumber()).to.equal(tradingPeriod)
    })

    it('sets token', async () => {
      expect(await futarchy.token()).to.equal(token.address)
    })

    it('sets futarchyOracleFactory', async () => {
      expect(await futarchy.futarchyOracleFactory()).to.equal(futarchyOracleFactory.address)
    })

    it('sets priceResolutionOracle', async () => {
      expect(await futarchy.priceResolutionOracle()).to.equal(priceResolutionOracle.address)
    })

    it('sets lmsrMarketMaker', async () => {
      expect(await futarchy.lmsrMarketMaker()).to.equal(lmsrMarketMaker.address)
    })
  })

  describe('newDecision()', async () => {
    let script, metadata, _logs, currentBlockNumber

    beforeEach(async () => {
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await futarchy.initialize(
        fee,
        tradingPeriod,
        token.address,
        futarchyOracleFactory.address,
        priceResolutionOracle.address,
        lmsrMarketMaker.address
      )
    })

    describe('the newly created Decision struct', async () => {
      beforeEach(async () => {
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

      it('sets the correct snapshotBlock', async () => {
        expect((await futarchy.decisions(0))[2].toNumber()).to.equal(currentBlockNumber)
      })

      it('sets executed to false', async () => {
        expect((await futarchy.decisions(0))[3]).to.equal(false)
      })

      it('sets the correct metadata', async () => {
        expect((await futarchy.decisions(0))[4]).to.equal(metadata)
      })

      it('sets the correct executionScript', async () => {
        expect((await futarchy.decisions(0))[5]).to.equal(stringToHex(script))
      })
    })

    it('emits an accurate StartDecision event', async () => {
      const { logs } = await futarchy.newDecision(script, metadata)
      const event = logs[0]
      expect(event.event).to.equal('StartDecision')
      expect(event.args.decisionId.toNumber()).to.equal(0)
      expect(event.args.creator).to.equal(root)
      expect(event.args.metadata).to.equal(metadata)
    })

    it('returns the decisionId number', async () => {
      expect((await futarchy.newDecision.call(script, metadata)).toNumber()).to.equal(0)
    })

    it('increments the decisionId number every time it is called', async () => {
      await futarchy.newDecision(script, 'abc')
      expect((await futarchy.newDecision.call(script, metadata)).toNumber()).to.equal(1)
    })
  })

  describe('getDecision()', async () => {
    let script, metadata, returnValue, currentBlockNumber
    beforeEach(async () => {
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
      await futarchy.initialize(
        fee,
        tradingPeriod,
        token.address,
        futarchyOracleFactory.address,
        priceResolutionOracle.address,
        lmsrMarketMaker.address
      )

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
