module.exports = function getFutarchyContract (artifacts, daoAddress) {
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
