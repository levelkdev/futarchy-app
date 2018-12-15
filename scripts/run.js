const execa = require('execa');
const deployDeps = require('./deploy_deps')

module.exports = async () => {
  try {
    const {
      miniMeTokenAddress,
      // centralizedOracleFactoryAddress,
      // lmsrMarketMakerAddress,
      // eventFactoryAddress,
      // standardMarketWithPriceLoggerFactoryAddress,
      // futarchyOracleFactoryAddress,
    } = await deployDeps(null, { artifacts })

    console.log('')
    console.log('token address: ', miniMeTokenAddress)
    console.log('')

    console.log('execute `aragon run`')
    console.log('')

    const run = execa('npm', ['run', 'start:aragon:http'])
    run.stdout.pipe(process.stdout)
  } catch (err) {
    console.log('Error in scripts/run.js: ', err)
  }
}
