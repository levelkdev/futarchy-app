import contractCall from './contractCall'
import contractFn from './contractFn'
import MiniMeToken from './MiniMeToken'
import traderDecisionHash from '../util/traderDecisionHash'

export const accounts = async () => {
  return new Promise((resolve, reject) => {
    window.aragonClient.accounts().subscribe(
      accounts => {
        console.log('client.accounts(): ', accounts)
        resolve(accounts)
      },
      err => {
        console.error('client.accounts(): Error: ', err)
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

export const decisions = async (decisionId) => {
  const decision = await call('decisions', parseInt(decisionId))
  return decision
}

export const avgPricesForDecisionMarkets = async (decisionId) => {
  const [ yesMarketPrice, noMarketPrice ] = await call('getAvgPricesForDecisionMarkets', decisionId)
  return { yesMarketPrice, noMarketPrice }
}

export const calcCosts = async (decisionId, outcomeTokenAmounts) => {
  const [ yesShort, yesLong, noShort, noLong ] = await call(
    'calcCosts', decisionId, outcomeTokenAmounts
  )
  return { yesShort, yesLong, noShort, noLong }
}

export const calcProfits = async (decisionId, outcomeTokenAmounts) => {
  const [ yesShort, yesLong, noShort, noLong ] = await call(
    'calcProfits', decisionId, outcomeTokenAmounts, {}
  )
  return { yesShort, yesLong, noShort, noLong }
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
    'redeemTokenWinnings',
    decisionId
  )
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
  avgPricesForDecisionMarkets,
  calcCosts,
  calcProfits,
  traderDecisionBalances,
  newDecision,
  buyMarketPositions,
  sendTransaction,
  redeemWinnings
}
