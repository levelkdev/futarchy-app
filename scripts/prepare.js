/**
 * Prepares for deployment by deploying dependencies and allocating tokens
 */

const getAccounts = require('@aragon/os/scripts/helpers/get-accounts')
const readAccounts = require('./deployConfig/readAccounts')
const deployLib = require('./deploy_lib')
const deployDeps = require('./deploy_deps')
const distributeTokens = require('./distribute_tokens')

const TOKEN_DISTRIBUTION_AMOUNT = 100000000 * 10 ** 18

const defaultOwner = process.env.OWNER

module.exports = async (
  truffleExecCallback,
  {
    owner = defaultOwner
  } = {}
) => {
  const network = process.argv[5]

  try {
    let accounts
    if (!owner) {
      accounts = readAccounts(network)
      owner = (await getAccounts(web3))[0]
    }

    console.log(`owner: ${owner}`)
    console.log('')

    await deployLib(null, { artifacts, network })
    console.log('')

    const {
      miniMeTokenAddress
    } = await deployDeps(null, { artifacts, network })
    console.log('')

    await distributeTokens(null, {
      artifacts,
      tokenAddress: miniMeTokenAddress,
      owner,
      accounts,
      amount: TOKEN_DISTRIBUTION_AMOUNT,
      network
    })
    console.log('')
    console.log('Prepare complete')
    console.log('')

  } catch (err) {
    console.log('Error in scripts/prepare.js: ', err)
    truffleExecCallback()
  }
}
