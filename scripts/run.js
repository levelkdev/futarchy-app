const execa = require('execa')
const getAccounts = require('@aragon/os/scripts/helpers/get-accounts')
const deployDeps = require('./deploy_deps')
const distributeTokens = require('./distribute_tokens')

const TOKEN_DISTRIBUTION_AMOUNT = 100000000 * 10 ** 18
const FEE = 20
const TRADING_PERIOD = 60 * 60 * 24 * 7
const TIME_TO_PRICE_RESOLUTION = TRADING_PERIOD * 2
const MARKET_FUND_AMOUNT = 10 * 10 ** 18

const defaultOwner = process.env.OWNER

module.exports = async (
  truffleExecCallback,
  {
    owner = defaultOwner
  } = {}
) => {
  try {
    let accounts
    if (!owner) {
      accounts = await getAccounts(web3)
      owner = accounts[0]
    }

    console.log(`owner: ${owner}`)
    console.log('')

    const {
      miniMeTokenAddress,
      futarchyOracleFactoryAddress,
      centralizedTimedOracleFactoryAddress,
      lmsrMarketMakerAddress
    } = await deployDeps(null, { artifacts })
    console.log('')

    await distributeTokens(null, {
      artifacts,
      tokenAddress: miniMeTokenAddress,
      owner,
      accounts,
      amount: TOKEN_DISTRIBUTION_AMOUNT
    })

    const aragonRunArgs = [
      'run',
      'start:aragon:http',
      '--',
      '--app-init-args',
      FEE,
      TRADING_PERIOD,
      TIME_TO_PRICE_RESOLUTION,
      MARKET_FUND_AMOUNT,
      miniMeTokenAddress,
      futarchyOracleFactoryAddress,
      centralizedTimedOracleFactoryAddress,
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
