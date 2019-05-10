/**
 * Uses aragon CLI to propagate IPFS /dist/ directory content given the root hash
 */

const { runExecaWithOutput, runExeca } = require('../utilities/execaUtil')

const rootHash = process.argv[2]

async function ipfsResolve (hash) {
  const ipfsRes = await runExeca('ipfs', ['resolve', `${rootHash}/dist`])
  const distHash = ipfsRes.stdout.replace('/ipfs/', '')
  return distHash
}

async function ipfsPropagate (hash) {
  const run = await runExecaWithOutput('aragon', ['ipfs', 'propagate', hash])
  return run
}

async function run () {
  const distHash = await ipfsResolve(rootHash)
  console.log('')

  console.log(`resolved hash of the /dist/ directory: ${distHash}`)
  console.log('')

  await ipfsPropagate(distHash)
}

run()
