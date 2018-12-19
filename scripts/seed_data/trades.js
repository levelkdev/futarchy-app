module.exports = async callback => {
  const FutarchyOracle = artifacts.require('FutarchyOracle')

  try {
    const daoAddress = process.argv[6]
    if (!daoAddress) {
      throw new Error('DAO address was not provided. Script expects `npm run seed:trades <DAO_ADDRESS>`. The DAO address can be copied from the `aragon run` output.')
    }

    console.log('executing some trades...')
    console.log('')

    const app = await getFutarchyContract(artifacts, daoAddress)

    const futarchyOracle = FutarchyOracle.at((await app.decisions(0))[0])
    console.log('FutarchyOracle address: ', futarchyOracle.address)
    console.log('')

  } catch (err) {
    console.log('Error in scripts/seed_data/trades.js: ', err)
  }

  callback()
}

function getFutarchyContract (artifacts, daoAddress) {
  const Kernel = artifacts.require('Kernel')
  const Futarchy = artifacts.require('Futarchy')

  const dao = Kernel.at(daoAddress)

  return new Promise((resolve, reject) => {
    dao.allEvents({
      fromBlock: 0,
      toBlock: 'latest'
    }).watch(async (err, res) => {
      if (err) {
        reject(err)
      }
      try {
        if (res.args.proxy) {
          const app = Futarchy.at(res.args.proxy)
          let tradingPeriod // using the `tradingPeriod` property to check if this
                            // is the right contract implementation
          try {
            tradingPeriod = await app.tradingPeriod()
          } catch (err) { }
          if (tradingPeriod) {
            resolve(app)
          }
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}
