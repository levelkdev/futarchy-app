import contractCall from './contractCall'
import contractFn from './contractFn'
import MiniMeToken from './MiniMeToken'

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

export const newDecision = async (script, question) => {
  // this includes a "pretransaction" to approve marketing funding token transfer
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
    transactionOptions
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
  tokenContract,
  tokenBalance,
  futarchyAddress,
  fee,
  tradingPeriod,
  marketFundAmount,
  newDecision,
  sendTransaction
}
