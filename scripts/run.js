const execa = require('execa')
const getAccounts = require('@aragon/os/scripts/helpers/get-accounts')
const deployDeps = require('./deploy_deps')

const FEE = 20
const TRADING_PERIOD = 60 * 60 * 24 * 7
const MARKET_FUND_AMOUNT = 10 * 10 ** 18

const defaultOwner = process.env.OWNER


module.exports = async (
  truffleExecCallback,
  {
    owner = defaultOwner
  } = {}
) => {
  try {
    if (!owner) {
      const accounts = await getAccounts(web3)
      owner = accounts[0]
    }

    console.log(`owner: ${owner}`)
    console.log('')

    const {
      miniMeTokenAddress,
      futarchyOracleFactoryAddress,
      centralizedOracleFactoryAddress,
      lmsrMarketMakerAddress
    } = await deployDeps(null, { artifacts })
    console.log('')

    const aragonRunArgs = [
      'run',
      'start:aragon:http',
      '--',
      '--app-init-args',
      FEE,
      TRADING_PERIOD,
      MARKET_FUND_AMOUNT,
      miniMeTokenAddress,
      futarchyOracleFactoryAddress,
      centralizedOracleFactoryAddress,
      lmsrMarketMakerAddress
    ]

    console.log(`npm ${aragonRunArgs.join(' ')}`)
    console.log('')

    const run = execa('npm', aragonRunArgs)
    run.stdout.pipe(process.stdout)
  } catch (err) {
    console.log('Error in scripts/run.js: ', err)
    truffleExecCallback()
  }
}
