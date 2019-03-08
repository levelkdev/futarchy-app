import { logDebug, logError } from '../util/logger'
import contractCall from './contractCall'
import contractFn from './contractFn'
import MiniMeToken from './MiniMeToken'
import FutarchyOracle from './FutarchyOracle'
import StandardMarketWithPriceLogger from './StandardMarketWithPriceLogger'
import traderDecisionHash from '../util/traderDecisionHash'

export const accounts = async () => {
  return new Promise((resolve, reject) => {
    window.aragonClient.accounts().subscribe(
      accounts => {
        logDebug('client.accounts(): ', accounts)
        resolve(accounts)
      },
      err => {
        logError('client.accounts(): Error: ', err)
        reject(err)
      }
    )
  })
}

export const blocktime = async () => {
  const blocktime = await call('blocktime')
  return blocktime
}

export const tokenContract = async () => {
  const tokenAddress = await call('token')
  const token = MiniMeToken(window.aragonClient, tokenAddress)
  return token
}

export const tokenBalance = async (account) => {
  const token = await tokenContract()
  const balance = await token.balanceOf(account)
  return balance
}

export const futarchyAddress = async () => {
  const futarchyAddress = await call('contractAddress')
  return futarchyAddress
}

export const fee = async () => {
  const fee = await call('fee')
  return fee
}

export const tradingPeriod = async () => {
  const tradingPeriod = await call('tradingPeriod')
  return tradingPeriod
}

export const marketFundAmount = async () => {
  const amount = await call('marketFundAmount')
  return amount
}

export const calcMarginalPrices = async (decisionId) => {
  const marginalPrices = await call('calcMarginalPrices', parseInt(decisionId))
  return marginalPrices
}

export const decisions = async (decisionId) => {
  const decision = await call('decisions', parseInt(decisionId))
  return decision
}

export const netOutcomeTokensSoldForDecision = async (decisionId, marketIndex) => {
  const [ shortOutcomeTokensSold, longOutcomeTokensSold ] = await call('getNetOutcomeTokensSoldForDecision', decisionId, marketIndex)
  return { shortOutcomeTokensSold, longOutcomeTokensSold }
}

export const traderDecisionBalances = async (decisionId, trader) => {
  const hash = traderDecisionHash(trader, decisionId)
  const balances = await call('traderDecisionBalances', hash)
  return {
    yesCollateral: balances.yesCollateral,
    noCollateral: balances.noCollateral,
    yesShort: balances.yesShort,
    yesLong: balances.yesLong,
    noShort: balances.noShort,
    noLong: balances.noLong
  }
}

// this function includes a "pretransaction" to approve marketing funding
// token transfer. Aragon client uses the `token` property in transaction
// options to send a token approval transaction before the requested
// transaction (in this case, a `newDecision` transaction)
export const newDecision = async (script, question, lowerBound, upperBound) => {
  const address = await call('token')
  const value = await marketFundAmount()
  const transactionOptions = {
    token: { address, value }
  }
  return contractFn(
    window.aragonClient,
    'client',
    'newDecision',
    script,
    question,
    lowerBound,
    upperBound,
    transactionOptions
  )
}

export const buyMarketPositions = async (
  decisionId,
  collateralAmount,
  yesPurchaseAmounts,
  noPurchaseAmounts
) => {
  const address = await call('token')

  // TODO: a buffer amount of .01 percent is negligible, but we're not making this
  //       transparent to the user. Also, in a fast moving market this might
  //       have to be set higher, which would be something that the user would need
  //       to know about before signing.
  collateralAmount = parseInt(collateralAmount) + (parseInt(collateralAmount) * 0.01)

  const transactionOptions = {
    token: { address, value: collateralAmount }
  }

  return contractFn(
    window.aragonClient,
    'client',
    'buyMarketPositions',
    decisionId,
    collateralAmount,
    yesPurchaseAmounts,
    noPurchaseAmounts,
    transactionOptions
  )
}

export const redeemWinnings = async (decisionId) => {
  return contractFn(
    window.aragonClient,
    'client',
    'redeemWinnings',
    decisionId
  )
}

export const yesNoMarketData = async (futarchyOracleAddress) => {
  const futarchyOracle = FutarchyOracle(window.aragonClient, futarchyOracleAddress)
  const markets = await futarchyOracle.markets()

  const yesMarket = StandardMarketWithPriceLogger(window.aragonClient, markets[0])
  const noMarket = StandardMarketWithPriceLogger(window.aragonClient, markets[1])

  const yesMarketFee = await yesMarket.fee()
  const noMarketFee = await noMarket.fee()

  const yesMarketFunding = await yesMarket.funding()
  const noMarketFunding = await noMarket.funding()

  const yesAveragePrice = await yesMarket.averagePrice()
  const noAveragePrice = await noMarket.averagePrice()

  const yesNetOutcomeTokensSold = await yesMarket.netOutcomeTokensSold()
  const noNetOutcomeTokensSold = await noMarket.netOutcomeTokensSold()

  return {
    yesMarketFee,
    noMarketFee,
    yesMarketFunding,
    noMarketFunding,
    yesAveragePrice,
    noAveragePrice,
    yesShortOutcomeTokensSold: yesNetOutcomeTokensSold[0],
    yesLongOutcomeTokensSold: yesNetOutcomeTokensSold[1],
    noShortOutcomeTokensSold: noNetOutcomeTokensSold[0],
    noLongOutcomeTokensSold: noNetOutcomeTokensSold[1]
  }
}

export const call = async (functionName, ...params) => {
  return contractCall(window.aragonClient, 'client', functionName, ...params)
}

export const sendTransaction = async (functionName, ...params) => {
  return contractFn(window.aragonClient, 'client', functionName, ...params)
}

export default {
  accounts,
  decisions,
  blocktime,
  tokenContract,
  tokenBalance,
  futarchyAddress,
  fee,
  tradingPeriod,
  marketFundAmount,
  calcMarginalPrices,
  netOutcomeTokensSoldForDecision,
  traderDecisionBalances,
  newDecision,
  buyMarketPositions,
  sendTransaction,
  redeemWinnings,
  yesNoMarketData
}
