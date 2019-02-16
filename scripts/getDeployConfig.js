const fs = require('fs')

module.exports = function getDeployConfig (network) {
  try {
    let contents = fs.readFileSync(`deploy.${network}.json`)
    return JSON.parse(contents)
  } catch (err) {
    console.log(`No existing deploy.${network}.json file found`)
  }
  return {}
}
