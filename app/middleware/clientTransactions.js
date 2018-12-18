import aragonClient from '../aragonClient'

const ZERO_BYTES_32 = '0x0000000000000000000000000000000000000000000000000000000000000000'

const clientTransactions = store => next => action => {
  switch (action.type) {
    case 'CREATE_DECISION':
      aragonClient.newDecision(ZERO_BYTES_32, action.question).subscribe(
        txHash => console.log(`tx ${txHash}`),
        err => console.log('newDecision Error: ', err)
      )
      break
    default:
      break
  }
  return next(action)
}

export default clientTransactions
