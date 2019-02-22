const configForNetwork = require('./deployConfig/configForNetwork')
const isLocalNetwork = require('./deployConfig/isLocalNetwork')
const writeDeployConfig = require('./deployConfig/writeDeployConfig')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const NULL_ADDRESS = '0x00'

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    network
  } = {}
) => {
  const MiniMeToken = artifacts.require('MiniMeToken')
  const CentralizedTimedOracleFactory = artifacts.require('CentralizedTimedOracleFactory')
  const Fixed192x64Math = artifacts.require('Fixed192x64Math')
  const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
  const CategoricalEvent = artifacts.require('CategoricalEvent')
  const ScalarEvent = artifacts.require('ScalarEvent')
  const OutcomeToken = artifacts.require('OutcomeToken')
  const FutarchyOracle = artifacts.require('FutarchyOracle')
  const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')
  const EventFactory = artifacts.require('EventFactory')
  const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')
  const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')

  console.log('NETWORK: ', network)

  let deployConfig = configForNetwork(network)

  try {
    console.log(`Deploying dependencies for "${network}" network`)

    const miniMeToken = await tryDeploy(
      MiniMeToken, 
      'MiniMeToken',
      [ NULL_ADDRESS, NULL_ADDRESS, 0, 'TokenCoin', 0, 'TKN', true ]
    )

    const centralizedTimedOracleFactory = await tryDeploy(
      CentralizedTimedOracleFactory,
      'CentralizedTimedOracleFactory'
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

    const futarchyOracleMaster = await tryDeploy(
      FutarchyOracle,
      'FutarchyOracle'
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
    console.log(`EventFactory instance: ${eventFactory.address}`)

    const standardMarketWithPriceLoggerFactory = await tryDeploy(
      StandardMarketWithPriceLoggerFactory,
      'StandardMarketWithPriceLoggerFactory',
      [
        standardMarketWithPriceLoggerMaster.address
      ]
    )

    const futarchyOracleFactory = await tryDeploy(
      FutarchyOracleFactory,
      'FutarchyOracleFactory',
      [
        futarchyOracleMaster.address,
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
        futarchyOracleFactoryAddress: futarchyOracleFactory.address
      }
    }
  } catch (err) {
    console.log('Error in scripts/deploy_deps.js: ', err)
  }

  async function tryDeploy(contractArtifact, contractName, params = []) {
    let contractInstance
    const deployedAddress = deployConfig.dependencyContracts[contractName]
    if (!deployedAddress) {
      contractInstance = await contractArtifact.new.apply(this, params)
      console.log(`Deployed ${contractName}: ${contractInstance.address}`)
      if (!isLocalNetwork(network)) {
        deployConfig.dependencyContracts[contractName] = contractInstance.address
        writeDeployConfig(network, deployConfig)
      }
    } else {
      contractInstance = await contractArtifact.at(deployedAddress)
      console.log(`${contractName} already deployed: ${deployedAddress}`)
    }
    return contractInstance
  }
}
