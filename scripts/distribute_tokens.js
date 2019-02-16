const getDeployConfig = require('./getDeployConfig')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    tokenAddress,
    owner,
    accounts,
    amount
  } = {}
) => {
  try {
    const network = process.argv[5]
    const deployConfig = getDeployConfig(network)

    if (deployConfig == {}) {
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
    } else {
      console.log(`Tokens already allocated for MiniMeToken ${deployConfig.MiniMeToken} on ${network} network`)
    }
    console.log('')
  } catch (err) {
    console.log('Error in scripts/distribute_token.js: ', err)
  }
}
