const DecisionMarketsFactory = artifacts.require('DecisionMarketsFactory')
const SettableDecisionMarkets = artifacts.require('SettableDecisionMarkets')
const DecisionMarketsMock = artifacts.require('DecisionMarketsMasterMock')
const EventFactory = artifacts.require('EventFactory')
const MarketFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')
const Market = artifacts.require('StandardMarketWithPriceLogger')
const ScalarEvent = artifacts.require('ScalarEvent')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ERC20Gnosis = artifacts.require('ERC20Gnosis')

const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const latestTimestamp = require('./helpers/latestTimestamp')(web3)

const MOCK_ORACLE_ADDRESS = '0x74c33f043ebc3c7c5ffe889ce6168199381ee7ce'
const MOCK_OUTCOME_COUNT = 2
const MOCK_LOWER_BOUND = 1
const MOCK_UPPER_BOUND = 100
const MOCK_MARKET_MAKER_ADDRESS = '0x863e1787bd2c3c116b531ab2824ccc03e356087f'
const MOCK_FEE = 0
const MOCK_TRADING_PERIOD = 1500

contract('Decision markets', (accounts) => {
  let decisionMarketsFactory
  let decisionMarketsMasterCopy, decisionCreator
  let settableDecisionMarketsMasterCopy
  let scalarEvent, categoricalEvent, token, market
  let root

  before(async () => {
    scalarEvent = (await ScalarEvent.new()).address
    categoricalEvent = (await CategoricalEvent.new()).address
    token = (await ERC20Gnosis.new()).address
    market = (await Market.new()).address
    eventFactoryAddr = (await EventFactory.new(scalarEvent, categoricalEvent, token)).address
    marketFactoryAddr = (await MarketFactory.new(market)).address
    root = accounts[0]
    decisionCreator = accounts[1]
    decisionMarketsMasterCopy = await DecisionMarketsMock.new()
    settableDecisionMarketsMasterCopy = await SettableDecisionMarkets.new()
  })

  describe('DecisionMarketsFactory', () => {

    describe('constructor()', () => {
      beforeEach(async () => {
        decisionMarketsFactory = await DecisionMarketsFactory.new(
          decisionMarketsMasterCopy.address,
          eventFactoryAddr,
          marketFactoryAddr
        )
      })

      it('sets the correct decisionMarketsMasterCopy', async () => {
        expect(await decisionMarketsFactory.decisionMarketsMasterCopy()).to.equal(decisionMarketsMasterCopy.address)
      })

      it('sets the correct eventFactory', async () => {
        expect(await decisionMarketsFactory.eventFactory()).to.equal(eventFactoryAddr)
      })

      it('sets the correct marketFactory', async () => {
        expect(await decisionMarketsFactory.marketFactory()).to.equal(marketFactoryAddr)
      })
    })
  })

  describe('DecisionMarketsBase', () => {

    describe('when created by DecisionMarketsFactory', () => {
      let decisionMarkets

      beforeEach(async () => {
        decisionMarketsFactory = await DecisionMarketsFactory.new(
          decisionMarketsMasterCopy.address,
          eventFactoryAddr,
          marketFactoryAddr
        )
        const logs = await createDecisionMarkets(decisionMarketsFactory)
        decisionMarkets = DecisionMarketsMock.at(logs[0].args.decisionMarkets)
      })

      it('creates a DecisionMarketsBase contract with correct decisionCreator', async () => {
        expect(await decisionMarkets.decisionCreator()).to.equal(decisionCreator)
      })

      it('creates a DecisionMarketsBase contract with msg.sender set as the creator', async () => {
        expect(await decisionMarkets.creator()).to.equal(root)
      })

      // TODO: add tests for categorical and scalar creation events
    })
  })

  describe('SettableDecisionMarkets', () => {

    describe('when created by DecisionMarketsFactory', () => {
      let settableDecisionMarkets

      beforeEach(async () => {
        decisionMarketsFactory = await DecisionMarketsFactory.new(
          settableDecisionMarketsMasterCopy.address,
          eventFactoryAddr,
          marketFactoryAddr
        )
        const logs = await createDecisionMarkets(decisionMarketsFactory)
        settableDecisionMarkets = SettableDecisionMarkets.at(logs[0].args.decisionMarkets)
      })

      describe('setExternalOutcome()', () => {
        it('sets externalOutcome to the given value', async () => {
          await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          expect((await settableDecisionMarkets.externalOutcome()).toNumber()).to.equal(1)
        })

        it('sets externalOutcomeIsSet to true', async () => {
          await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          expect(await settableDecisionMarkets.externalOutcomeIsSet()).to.equal(true)
        })

        it('emits an ExternalOutcomeSet event', async () => {
          const { logs } = await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          expect(logs[0].event).to.equal('ExternalOutcomeSet')
        })

        it('reverts if external outcome is greater than 1', async () => {
          return assertRevert(async () => {
            await settableDecisionMarkets.setExternalOutcome(2, { from: decisionCreator })
          })
        })

        it('reverts if isSet is true', async () => {
          await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          await settableDecisionMarkets.setOutcome()
          return assertRevert(async () => {
            await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          })
        })

        it('reverts if called by an address other than decisionCreator', async () => {
          return assertRevert(async () => {
            await settableDecisionMarkets.setExternalOutcome(1)
          })
        })
      })

      describe('setOutcome()', () => {
        it('sets winningMarketIndex to externalOutcome value', async () => {
          await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          await settableDecisionMarkets.setOutcome()
          expect((await settableDecisionMarkets.winningMarketIndex()).toNumber()).to.equal(1)
        })

        it('sets isSet to true', async () => {
          await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          await settableDecisionMarkets.setOutcome()
          expect(await settableDecisionMarkets.isSet()).to.equal(true)
        })

        it('emits an OutcomeAssignment event', async () => {
          await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          const { logs } = await settableDecisionMarkets.setOutcome()
          expect(logs[0].event).to.equal('OutcomeAssignment')
        })

        it('reverts if outcome has already been set', async () => {
          await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          await settableDecisionMarkets.setOutcome()
          return assertRevert(async () => {
            await settableDecisionMarkets.setOutcome() 
          })
        })

        it('reverts if external outcome has not been set', async () => {
          return assertRevert(async () => {
            await settableDecisionMarkets.setOutcome() 
          })
        })
      })

      describe('outcomeCanBeSet()', () => {
        it('returns true if external outcome has been set', async () => {
          await settableDecisionMarkets.setExternalOutcome(1, { from: decisionCreator })
          expect(await settableDecisionMarkets.outcomeCanBeSet()).to.equal(true)
        })

        it('returns false if external outcome has not been set', async () => {
          expect(await settableDecisionMarkets.outcomeCanBeSet()).to.equal(false)
        })
      })
    })
  })
  
  async function createDecisionMarkets(_decisionMarketsFactory) {
    const { logs } = await _decisionMarketsFactory.createDecisionMarkets(
      decisionCreator,
      token,
      MOCK_ORACLE_ADDRESS,
      MOCK_OUTCOME_COUNT,
      MOCK_LOWER_BOUND,
      MOCK_UPPER_BOUND,
      MOCK_MARKET_MAKER_ADDRESS,
      MOCK_FEE,
      MOCK_TRADING_PERIOD,
      (await latestTimestamp()) + 1
    )
    return logs
  }

  // TODO: test FutarchyDecisionMarkets
})
