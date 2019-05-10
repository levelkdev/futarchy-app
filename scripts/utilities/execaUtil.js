const execa = require('execa')

async function runExecaWithOutput (cmd, args) {
  const run = await runExeca(cmd, args, true)
  return run
}

async function runExeca (cmd, args, output) {
  console.log(`${cmd} ${args.join(' ')}`)
  const promise = execa(cmd, args)
  if (output) {
    promise.stdout.pipe(process.stdout)
  }
  const run = await promise
  return run
}

module.exports = { runExecaWithOutput, runExeca }
