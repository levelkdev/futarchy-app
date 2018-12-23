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

export const tokenBalance = async (account) => {
  const tokenAddress = await call('token')
  const token = MiniMeToken(window.aragonClient, tokenAddress)
  const balance = await token.balanceOf(account)
  // console.log('TOKEN: ', token)
  // const balance = await contractFn(token, 'miniMeToken', 'balanceOf', account)
  console.log('BALANCE: ', balance)
  return balance
}

export const call = async (functionName, ...params) => {
  return contractCall(window.aragonClient, 'client', functionName, ...params)
}

export const sendTransaction = async (functionName, ...params) => {
  return contractFn(window.aragonClient, 'client', functionName, ...params)
}

export default {
  accounts,
  tokenBalance,
  sendTransaction
}
