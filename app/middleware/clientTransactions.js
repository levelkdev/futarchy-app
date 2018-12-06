import aragonClient from '../aragonClient'

const clientTransactions = store => next => action => {
  switch (action.type) {
    case 'CREATE_DECISION':
      aragonClient.newDecision(action.question)
      break
    default:
      break
  }
  return next(action)
}

export default clientTransactions
