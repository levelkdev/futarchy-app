/**
 * Uses aragon CLI to propagate IPFS root hash content
 */

const async = require('async')
const execa = require('execa')

const rootHash = process.argv[2]

async.parallel([
  () => {
    const run = runExeca('aragon', ['ipfs', 'propagate', rootHash])
    return run
  }
], (err) => {
  if (!err) {
    console.log('')
    console.log('Propagate complete')
    console.log('')
  } else {
    console.log('Error in scripts/propagate.js: ', err)
  }
})

function runExeca(cmd, args) {
  console.log(`${cmd} ${args.join(' ')}`)
  const run = execa(cmd, args)
  run.stdout.pipe(process.stdout)
  return run
}
