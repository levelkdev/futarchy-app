const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const globalWeb3 = this.web3 // Not injected unless called directly via truffle
const defaultOwner = process.env.OWNER

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    web3 = globalWeb3,
    owner = defaultOwner,
    //
  } = {}
) => {
  try {
    const errorOut = (msg) => {
      console.error(msg)
      throw new Error(msg)
    }

    if (typeof truffleExecCallback === 'function') {
      truffleExecCallback()
    } else {
      return {
        //
      }
    }
  } catch (err) {
    console.log('Error in scripts/deploy.js: ', err)
  }
}
