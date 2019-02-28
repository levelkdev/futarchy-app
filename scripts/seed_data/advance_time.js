const advanceTime = require('../utilities/advanceTime')

module.exports = async (callback) => {
  try {
    const seconds = process.argv[6]

    if (!seconds) {
      throw new Error('The correct arguments were not provided. Script expects `npm run advance-time <seconds>. 16 days equals to 1382400 seconds')
    }

    await advanceTime(web3, seconds)
  } catch (err) {
    console.log('Error in scripts/seed_data/advance_time.js: ', err)
  }

  callback()
}
