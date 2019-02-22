const fs = require('fs')

module.exports = function writeDeployConfig (network, deployConfig) {
  fs.writeFileSync(
    `deploy.${network}.json`,
    JSON.stringify(deployConfig, null, 4)
  )
}
