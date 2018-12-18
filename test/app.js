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
const FutarchyOracle = artifacts.require('FutarchyOracleMock.sol')
const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactoryMock.sol')
const Fixed192x64Math = artifacts.require('Fixed192x64Math')

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

const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDRESS = '0x00'

contract('Futarchy', (accounts) => {
  let APP_MANAGER_ROLE
  let futarchyBase, daoFact
  let futarchy, fee, tradingPeriod, token, priceOracleFactory, futarchyOracleFactory, lmsrMarketMaker
  let metadata, script, executionTarget

  const root = accounts[0]

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

    fee = 20
    tradingPeriod = 60 * 60 * 24 * 7
    priceOracleFactory = await CentralizedOracleFactory.new(centralizedOracleMaster.address)
    lmsrMarketMaker = await LMSRMarketMaker.new()
    futarchyOracleFactory = await deployFutarchyMasterCopies()
  })

  beforeEach(async () => {
    const r = await daoFactory.newDAO(root)
    const dao = await Kernel.at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
    const acl = ACL.at(await dao.acl())
    await acl.createPermission(root, dao.address, APP_MANAGER_ROLE, root, { from: root })
    const receipt = await dao.newAppInstance('0x1234', futarchyBase.address, '0x', false, { from: root })
    token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true)
    futarchy = Futarchy.at(receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
    const CREATE_DECISION_ROLE = await futarchy.CREATE_DECISION_ROLE()
    await acl.createPermission(root, futarchy.address, CREATE_DECISION_ROLE, root);

    await futarchy.initialize(
      fee,
      tradingPeriod,
      token.address,
      futarchyOracleFactory.address,
      priceOracleFactory.address,
      lmsrMarketMaker.address
    )
})

  describe('initialize()', async () => {
    it('can only be called once on an instance of Futarchy', async () => {
      return assertRevert(async () => {
        await futarchy.initialize(
          fee,
          tradingPeriod,
          token.address,
          futarchyOracleFactory.address,
          priceOracleFactory.address,
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
      script = 'QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz'
      metadata = 'Give voting rights to all kitties in the world'
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
      executionTarget = await ExecutionTarget.new()
      script = await encodeExecutionScript(executionTarget)
      metadata = 'Give voting rights to all kitties in the world'

      await futarchy.newDecision(script, metadata)
      decisionId = 0
      futarchyOracle = await FutarchyOracle.at((await futarchy.decisions(0))[0])
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
})

async function deployFutarchyMasterCopies() {
   let futarchyOracleFactory = await FutarchyOracleFactory.new()
  return futarchyOracleFactory

}

async function encodeExecutionScript(executionTargetParam) {
  executionTarget = executionTargetParam || await ExecutionTarget.new()
  const action = { to: executionTarget.address, calldata: executionTarget.contract.execute.getData() }
  return encodeCallScript([action])
}
