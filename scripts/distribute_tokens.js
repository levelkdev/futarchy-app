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
    console.log('')

  } catch (err) {
    console.log('Error in scripts/distribute_token.js: ', err)
  }
}
