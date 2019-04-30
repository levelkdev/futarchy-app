const fs = require('fs')
const tryDeployToNetwork = require('./utilities/tryDeployToNetwork')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    network
  } = {}
) => {
  const DecisionLib = artifacts.require('DecisionLib')
  const Futarchy = artifacts.require('Futarchy')

  try {
    console.log(`Deploying library dependencies for "${network}" network`)
    console.log('')

    // WORKAROUND: link the DecisionLib library using truffle's `link` function. This replaces
    //             the `__DecisionLib___________________________` placeholder in the Futarchy
    //             contract bytecode with the address of the deployed DecisionLib contract.
    //             then copy this bytecode to `build/contracts/Futarchy.json` so it gets used
    //             by the aragon CLI.
    const decisionLib = await tryDeployToNetwork(network, DecisionLib, 'DecisionLib')
    console.log(`Linking Futarchy bytecode to deployed DecisionLib contract at ${decisionLib.address}`)
    await Futarchy.link('DecisionLib', decisionLib.address)
    updateFutarchyBytecode_WORKAROUND(Futarchy.binary)

    if (typeof truffleExecCallback === 'function') {
      truffleExecCallback()
    }
  } catch (err) {
    console.log('Error in scripts/deploy_lib.js: ', err)
  }
}

function updateFutarchyBytecode_WORKAROUND (bytecode) {
  const path = 'build/contracts/Futarchy.json'
  console.log(`Copying linked bytecode to ${path}`)
  let futarchyJSON = JSON.parse(fs.readFileSync(path))
  futarchyJSON.bytecode = bytecode
  fs.writeFileSync(path, JSON.stringify(futarchyJSON, null, 4))
}
