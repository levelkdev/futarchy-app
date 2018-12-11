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
    futarchy = Futarchy.at(receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
})


  describe('testing 123 describe block', async () => {
    beforeEach(async () => {
      token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true)
      const { logs } = await centralizedOracleFactory.createCentralizedOracle("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz")
      priceResolutionOracle = await CentralizedOracle.at(logs[0].args.centralizedOracle)
      await futarchy.initialize(
        20,
        60 * 60 * 24 * 7,
        token.address,
        futarchyOracleFactory.address,
        logs[0].args.centralizedOracle,
        lmsrMarketMaker.address
      )
    })

    it.only('should be tested', async () => {
      await futarchy.newDecision("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz", 'give all dogs voting rights')
      expect((await futarchy.decisions(0))[4]).to.equal('give all dogs voting rights')
    })
  })

  describe('initialize()', async () => {
    beforeEach(async () => {
      token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true)
      futarchy = await Futarchy.new()
      const { logs } = await centralizedOracleFactory.createCentralizedOracle("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz")
      priceResolutionOracle = await CentralizedOracle.at(logs[0].args.centralizedOracle)
      await futarchy.initialize(
        20,
        60 * 60 * 24 * 7,
        token.address,
        futarchyOracleFactory.address,
        logs[0].args.centralizedOracle,
        lmsrMarketMaker.address
      )
    })

    it('can only be called once on an instance of Futarchy', async () => {
      // TODO: get Futarchy.sol to work with Initializeable (right now initOnly reverts)
    })

    it('sets fee', async () => {

    })

    it('sets tradingPeriod')
    it('sets token')
    it('sets futarchyOracleFactory')
    it('sets priceResolutionOracle')
    it('sets lmsrMarketMaker')
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
