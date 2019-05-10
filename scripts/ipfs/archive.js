/**
 * Saves an archive file for the given IPFS root hash
 */

const fs = require('fs')
const readArappEnv = require('../deployConfig/readArappEnv')
const { runExecaWithOutput } = require('../utilities/execaUtil')

const environment = process.argv[2]
const version = process.argv[3]
const rootHash = process.argv[4]

const archivePath = 'ipfs_archives'
const path = `${archivePath}/${environment}`

function mkdir (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

function getAppName () {
  const { appName } = readArappEnv(environment)
  return appName
}

async function getIpfsArchive () {
  const archiveFileName = `${path}/${getAppName()}@${version}`
  const run = await runExecaWithOutput('ipfs', [
    'get',
    '-a',
    '-C',
    '-o',
    archiveFileName,
    rootHash
  ])
  console.log(`Created archive ${archiveFileName}.tar.gz`)
  return run
}

async function run () {
  mkdir(archivePath)
  mkdir(path)
  await getIpfsArchive(rootHash)
}

run()
