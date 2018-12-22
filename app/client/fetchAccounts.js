export default async () => {
  return new Promise((resolve, reject) => {
    window.aragonClient.accounts().subscribe(
      accounts => {
        console.log('fetchAccounts(): ', accounts)
        resolve(accounts)
      },
      err => {
        console.error('fetchAccounts(): Error: ', err)
        reject(err)
      }
    )
  })
}
