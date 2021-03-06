const tryDeployToNetwork = require('./utilities/tryDeployToNetwork')
const getAccounts = require('@aragon/os/scripts/helpers/get-accounts')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const globalWeb3 = this.web3

const NULL_ADDRESS = '0x00'

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    network,
    web3 = globalWeb3
  } = {}
) => {
  const MiniMeToken = artifacts.require('MiniMeToken')
  const CentralizedTimedOracleFactory = artifacts.require('CentralizedTimedOracleFactory')
  const Fixed192x64Math = artifacts.require('Fixed192x64Math')
  const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
  const CategoricalEvent = artifacts.require('CategoricalEvent')
  const ScalarEvent = artifacts.require('ScalarEvent')
  const OutcomeToken = artifacts.require('OutcomeToken')
  const SettableDecisionMarkets = artifacts.require('SettableDecisionMarkets')
  const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')
  const EventFactory = artifacts.require('EventFactory')
  const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')
  const DecisionMarketsFactory = artifacts.require('DecisionMarketsFactory')

  try {
    if (!network) network = process.argv[5]

    console.log(`Deploying dependencies for "${network}" network`)
    console.log('')

    const ownerAccount = (await getAccounts(web3))[0]

    const miniMeToken = await tryDeploy(
      MiniMeToken,
      'MiniMeToken',
      [ NULL_ADDRESS, NULL_ADDRESS, 0, 'TokenCoin', 0, 'TKN', true ]
    )

    const centralizedTimedOracleFactory = await tryDeploy(
      CentralizedTimedOracleFactory,
      'CentralizedTimedOracleFactory',
      [ownerAccount]
    )

    const fixed192x64Math = await tryDeploy(
      Fixed192x64Math,
      'Fixed192x64Math'
    )

    await LMSRMarketMaker.link('Fixed192x64Math', fixed192x64Math.address)

    const lmsrMarketMaker = await tryDeploy(
      LMSRMarketMaker,
      'LMSRMarketMaker'
    )

    const categoricalEventMaster = await tryDeploy(
      CategoricalEvent,
      'CategoricalEvent'
    )

    const scalarEventMaster = await tryDeploy(
      ScalarEvent,
      'ScalarEvent'
    )

    const outcomeTokenMaster = await tryDeploy(
      OutcomeToken,
      'OutcomeToken'
    )

    const settableDecisionMarketsMaster = await tryDeploy(
      SettableDecisionMarkets,
      'SettableDecisionMarkets'
    )

    const standardMarketWithPriceLoggerMaster = await tryDeploy(
      StandardMarketWithPriceLogger,
      'StandardMarketWithPriceLogger'
    )

    const eventFactory = await tryDeploy(
      EventFactory,
      'EventFactory',
      [
        categoricalEventMaster.address,
        scalarEventMaster.address,
        outcomeTokenMaster.address
      ]
    )

    const standardMarketWithPriceLoggerFactory = await tryDeploy(
      StandardMarketWithPriceLoggerFactory,
      'StandardMarketWithPriceLoggerFactory',
      [
        standardMarketWithPriceLoggerMaster.address
      ]
    )

    const decisionMarketsFactory = await tryDeploy(
      DecisionMarketsFactory,
      'DecisionMarketsFactory',
      [
        settableDecisionMarketsMaster.address,
        eventFactory.address,
        standardMarketWithPriceLoggerFactory.address
      ]
    )

    if (typeof truffleExecCallback === 'function') {
      truffleExecCallback()
    } else {
      return {
        miniMeTokenAddress: miniMeToken.address,
        centralizedTimedOracleFactoryAddress: centralizedTimedOracleFactory.address,
        lmsrMarketMakerAddress: lmsrMarketMaker.address,
        eventFactoryAddress: eventFactory.address,
        standardMarketWithPriceLoggerFactoryAddress: standardMarketWithPriceLoggerFactory.address,
        decisionMarketsFactoryAddress: decisionMarketsFactory.address
      }
    }
  } catch (err) {
    console.log('Error in scripts/deploy_deps.js: ', err)
  }

  async function tryDeploy (contractArtifact, contractName, params = []) {
    const resp = await tryDeployToNetwork(network, contractArtifact, contractName, params)
    return resp
  }
}
