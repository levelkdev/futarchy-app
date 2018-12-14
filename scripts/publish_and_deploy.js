/**
 * This script isn't used right now, but might come in handy when we have to deploy to testnet/mainnet
 */

// // ℹ This is the configuration for your development deployment:
// // Ethereum Node: ws://localhost:8535
// // ENS registry: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1
// // APM registry: aragonpm.eth
// // DAO address: 0xD0eDd2D67f9bB1fBb26dA732CFAAd37A5ab55c3E

// // Opening http://localhost:3000/#/0xD0eDd2D67f9bB1fBb26dA732CFAAd37A5ab55c3E to view your DAO


const namehash = require('eth-ens-namehash').hash

const getAccounts = require('@aragon/os/scripts/helpers/get-accounts')
const deployDAOFactory = require('@aragon/os/scripts/deploy-daofactory.js')
const logDeploy = require('@aragon/os/scripts/helpers/deploy-logger')

const getEventResult = (receipt, event, param) => receipt.logs.filter(l => l.event == event)[0].args[param]
const getAppProxy = (receipt, id, index=0) => receipt.logs.filter(l => l.event == 'InstalledApp' && l.args.appId == id)[index].args.appProxy

const appContract = 'StubFutarchyApp'
const appEnsName = require(`../arapp`).environments.default.appName
const appName = appEnsName.split('.')[0]
const appId = namehash(appEnsName)

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const globalWeb3 = this.web3 // Not injected unless called directly via truffle
const defaultOwner = process.env.OWNER
const defaultENSAddress = process.env.ENS || '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1'
const defaultDAOFactoryAddress = process.env.DAO_FACTORY
const defaultMinimeTokenAddress = process.env.MINIME_TOKEN

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    web3 = globalWeb3,
    owner = defaultOwner,
    ensAddress = defaultENSAddress,
    daoFactoryAddress = defaultDAOFactoryAddress,
    minimeTokenAddress = defaultMinimeTokenAddress
  } = {}
) => {
  try {
    const kitName = 'bare-kit'

    const errorOut = (msg) => {
      console.error(msg)
      throw new Error(msg)
    }

    if (!owner) {
      const accounts = await getAccounts(web3)
      owner = accounts[0]
      console.log(`setting APM owner to ${owner}`)
    }

    console.log(`${kitName} with ENS ${ensAddress}, owner ${owner}`)

    const DAOFactory = artifacts.require('DAOFactory')
    const ENS = artifacts.require('ENS')

    if (!ensAddress) {
      errorOut('ENS environment variable not passed, aborting.')
    }
    console.log('Using ENS', ensAddress)
    const ens = ENS.at(ensAddress)

    if (!daoFactoryAddress) {
      const daoFactory = (await deployDAOFactory(null, { artifacts, verbose: false })).daoFactory
      daoFactoryAddress = daoFactory.address
    }
    console.log(`Using DAOFactory: ${daoFactoryAddress}`)

    const apmAddress = await artifacts.require('PublicResolver').at(await ens.resolver(namehash('aragonpm.eth'))).addr(namehash('aragonpm.eth'))
    if (!apmAddress) {
      errorOut('No APM found for ENS, aborting.')
    }
    console.log('APM', apmAddress);
    const apm = artifacts.require('APMRegistry').at(apmAddress)

    // const registrarAddr = await apm.registrar()
    // console.log(`registrarAddr: ${registrarAddr}`)
    // const registrar = await artifacts.require('ENSSubdomainRegistrar').at(registrarAddr)

    // registrar.NewName().watch((err, result) => {
    //   if (err) console.error(err)
    //   else console.log('NewName: ', result)
    // })

    if (await ens.owner(appId) == '0x0000000000000000000000000000000000000000') {
      console.log(`Deploying ${appName}`)
      await newRepo(apm, appName, owner, appContract)
    }

    if (await ens.owner(appId) == '0x0000000000000000000000000000000000000000') {
      errorOut(`Missing app ${appName}, aborting.`)
    }

    const futarchyKit = await artifacts.require('FutarchyKit').new(daoFactoryAddress, ensAddress)
    await logDeploy(futarchyKit)

    const futarchyKitReceipt = await futarchyKit.newInstance(owner)
    console.log('Gas used:', futarchyKitReceipt.receipt.cumulativeGasUsed)
    const futarchyDaoAddr = getEventResult(futarchyKitReceipt, 'DeployInstance', 'dao')
    console.log('Futarchy DAO address: ', futarchyDaoAddr)

    const futarchyAddress = getAppProxy(futarchyKitReceipt, appId)
    console.log('Futarchy address: ', futarchyAddress)

    if (typeof truffleExecCallback === 'function') {
      truffleExecCallback()
    } else {
      return {
        futarchyDaoAddr,
        futarchyAddress
      }
    }
  } catch (err) {
    console.log('Error in scripts/deploy.js: ', err)
  }
}

const newRepo = async (apm, name, acc, contract) => {
  console.log(`Creating Repo for ${contract}`)
  const c = await artifacts.require(contract).new()
  return await apm.newRepoWithVersion(name, acc, [1, 0, 0], c.address, '0x1245')
}
