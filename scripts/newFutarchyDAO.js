/**
 * Creates a new DAO, installs the Futarchy app, and sets up roles
 */
const _ = require('lodash')
const execa = require('execa')
const getAccounts = require('@aragon/os/scripts/helpers/get-accounts')
const readArappEnv = require('./deployConfig/readArappEnv')
const readDeployConfig = require('./deployConfig/readDeployConfig')

const defaultOwner = process.env.OWNER

const FEE = 20
const TRADING_PERIOD = 60 * 60 * 24 * 7
const TIME_TO_PRICE_RESOLUTION = TRADING_PERIOD * 2
const MARKET_FUND_AMOUNT = 10 * 10 ** 18

const environment = process.argv[7]

module.exports = async (
  truffleExecCallback,
  {
    owner = defaultOwner
  } = {}
) => {
  try {
    const { network, appName } = readArappEnv(environment)
    const cfg = readDeployConfig(network)
    
    const {
      MiniMeToken: miniMeTokenAddress,
      FutarchyOracleFactory: futarchyOracleFactoryAddress,
      CentralizedTimedOracleFactory: centralizedTimedOracleFactoryAddress,
      LMSRMarketMaker: lmsrMarketMakerAddress
    } = cfg.dependencyContracts

    if (!owner) {
      owner = (await getAccounts(web3))[0]
    }

    console.log(`Creating a new DAO on ${network} network...`)
    console.log('')

    const daoNewOutput = await runNpmScript('dao:new', [
      '--environment',
      environment
    ])
    const { stdout } = daoNewOutput
    const daoAddress = daoAddressFromSTDOUT(stdout)

    console.log('')

    console.log(`Installing the ${appName} app on DAO:<${daoAddress}>...`)
    console.log('')
    
    const daoInstallOutput = await runNpmScript('dao:install', [
      daoAddress,
      appName,
      '--environment',
      environment,
      '--set-permissions',
      'open',
      '--app-init-args',
      FEE,
      TRADING_PERIOD,
      TIME_TO_PRICE_RESOLUTION,
      MARKET_FUND_AMOUNT,
      miniMeTokenAddress,
      futarchyOracleFactoryAddress,
      centralizedTimedOracleFactoryAddress,
      lmsrMarketMakerAddress
    ])

    const appAddress = appAddressFromSTDOUT(daoInstallOutput.stdout, appName)

    console.log('')
    console.log(`Add owner:<${owner}> to role "CREATE_DECISIONS_ROLE"`)
    console.log('')

    await runNpmScript('dao:acl:create', [
      daoAddress,
      appAddress,
      'CREATE_DECISION_ROLE',
      owner,
      owner,
      '--environment',
      environment,
    ])

    console.log('')
    console.log('Complete')
    console.log('')
  } catch (err) {
    console.log('Error in scripts/newFutarchyDAO.js: ', err)
    truffleExecCallback()
  }
}

function runNpmScript (scriptName, args = []) {
  if (args.length > 0) args.unshift('--')
  const cmdArgs = _.concat(['run', scriptName], args)
  console.log(`npm ${cmdArgs.join(' ')}`)
  console.log('')
  const run = execa('npm', cmdArgs)
  run.stdout.pipe(process.stdout)
  return run
}

function daoAddressFromSTDOUT (stdout) {
  return valueFromSTDOUT(stdout, 'Created DAO: ')
}

function appAddressFromSTDOUT (stdout, appName) {
  return valueFromSTDOUT(stdout, `Installed ${appName} at: `)
}

function valueFromSTDOUT (stdout, key) {
  const addrLen = 42
  return stdout.substr(stdout.indexOf(key) + key.length, addrLen)
}
