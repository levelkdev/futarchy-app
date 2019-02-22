const configForNetwork = require('./deployConfig/configForNetwork')
const isLocalNetwork = require('./deployConfig/isLocalNetwork')
const writeDeployConfig = require('./deployConfig/writeDeployConfig')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    tokenAddress,
    owner,
    accounts,
    amount,
    network
  } = {}
) => {
  let deployConfig = configForNetwork(network)

  try {

    if (!deployConfig.tokensDistributed) {
      console.log('distributing tokens...')
      console.log('')

      const MiniMeToken = artifacts.require('MiniMeToken')
      const token = MiniMeToken.at(tokenAddress)

      let account
      for (var i in accounts) {
        account = accounts[i]
        console.log(`allocating ${amount} tokens to ${account}`)
        await token.generateTokens(account, amount, { from: owner })
      }
      if (!isLocalNetwork(network)) {
        deployConfig.tokensDistributed = true
        writeDeployConfig(network, deployConfig)
      }
    } else {
      console.log(`Tokens already allocated for MiniMeToken ${deployConfig.MiniMeToken} on ${network} network`)
    }
    console.log('')
  } catch (err) {
    console.log('Error in scripts/distribute_token.js: ', err)
  }
}
