const fs = require('fs')

module.exports = function readAccounts (environment) {
  let arapp
  try {
    let contents = fs.readFileSync(`arapp.json`)
    arapp = JSON.parse(contents)
  } catch (err) {
    throw new Error('No existing arapp.json file found')
  }
  if (arapp.environments && arapp.environments[environment]) {
    return arapp.environments[environment]
  } else {
    throw new Error(`No environment ${environment} found in arapp.json`)
  }
}
