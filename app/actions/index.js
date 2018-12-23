import _ from 'lodash'
import client from '../client'

export const newDecisionTxPending = ({ question, txHash }) => ({
  type: 'NEW_DECISION_TX_PENDING',
  question,
  txHash
})

export const showPanel = ({ panelName }) => ({
  type: 'SHOW_PANEL',
  panelName
})

export const hidePanel = () => ({
  type: 'HIDE_PANEL'
})

export const accountsLoaded = ({ accounts }) => ({
  type: 'ACCOUNTS_LOADED',
  accounts
})

export const accountsLoadingError = ({ errorMessage }) => ({
  type: 'ACCOUNTS_LOADING_ERROR',
  errorMessage
})

export const tokenBalanceLoaded = ({ balance }) => ({
  type: 'TOKEN_BALANCE_LOADED',
  balance
})

export const tokenBalanceLoadingError = ({ errorMessage }) => ({
  type: 'TOKEN_BALANCE_LOADING_ERROR',
  errorMessage
})

export const newDecision = (bytes32Script, question) => dispatch => {
  return client.sendTransaction('newDecision', bytes32Script, question).then(txHash => {
    dispatch(newDecisionTxPending({ question, txHash }))
  }, err => {
    // TODO: dispatch error action, to show something to the user
  })
}

export const fetchAccounts = () => dispatch => {
  return client.accounts().then(
    accounts => dispatch(accountsLoaded({ accounts })),
    errorMessage => {
      console.error(errorMessage)
      return dispatch(accountsLoadingError({ errorMessage }))
    }
  )
}

export const fetchTokenBalance = (account) => dispatch => {
  return client.tokenBalance(account).then(
    tokenBalance => dispatch(tokenBalanceLoaded({ balance: tokenBalance })),
    errorMessage => {
      console.error(errorMessage)
      return dispatch(tokenBalanceLoadingError({ errorMessage }))
    }
  )
}

export const fetchInitData = () => (dispatch, getState) => {
  return dispatch(fetchAccounts()).then(() => 
    dispatch(fetchTokenBalance(getState().accounts[0]))
  )
}
