/**
 * Publishes the Futarchy app to the APM
 */

const async = require('async')
const execa = require('execa')

const environment = process.argv[2]
const versionBump = process.argv[3] // 'major' || 'minor'

const aragonPublishArgs = [
  'run',
  'publish',
  '--',
  versionBump,
  '--environment',
  environment
]

console.log(`npm ${aragonPublishArgs.join(' ')}`)
console.log('')

async.parallel([
  () => {
    const run = execa('npm', aragonPublishArgs)
    run.stdout.pipe(process.stdout)
    return run
  }
], (err) => {
  if (!err) {
    console.log('')
    console.log('Publish complete')
    console.log('')
  } else {
    console.log('Error in scripts/publish.js: ', err)
  }
})
