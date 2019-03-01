const fs = require('fs')

module.exports = function readAccounts (network) {
  try {
    let contents = fs.readFileSync(`accounts.${network}.json`)
    return JSON.parse(contents)
  } catch (err) {
    console.log(`No existing accounts.${network}.json file found`)
  }
  return []
}
