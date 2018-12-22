import _ from 'lodash'
import sendTransaction from '../client/sendTransaction'
import fetchAccounts from '../client/fetchAccounts'

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

export const newDecision = (bytes32Script, question) => dispatch => {
  return sendTransaction('newDecision', [bytes32Script, question]).then(txHash => {
    dispatch(newDecisionTxPending({ question, txHash }))
  }, err => {
    // TODO: dispatch error action, to show something to the user
  })
}

export const fetchInitData = () => dispatch => {
  return fetchAccounts().then(accounts => {
    dispatch(accountsLoaded({ accounts }))
  }, errorMessage => {
    console.error(errorMessage)
    dispatch(accountsLoadingError({ errorMessage }))
  })
}
