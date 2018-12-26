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

// property value loaded from the Futarchy smart contract
export const propValueLoaded = ({ prop, value }) => ({
  type: 'PROP_VALUE_LOADED',
  prop,
  value
})

// error loading property value from the Futarchy smart contract
export const propValueLoadingError = ({ prop, errorMessage }) => ({
  type: 'PROP_VALUE_LOADING_ERROR',
  prop, 
  errorMessage
})

export const newDecision = (bytes32Script, question, fundingAmount) => dispatch => {
  return client.sendTransaction('newDecision', bytes32Script, question).then(txHash => {
    dispatch(newDecisionTxPending({ question, txHash }))
  }, err => {
    // TODO: dispatch error action, to show something to the user
  })
}

export const fetchAccounts = () => dispatch => {
  return client.accounts().then(
    accounts => dispatch(propValueLoaded({ prop: 'accounts', value: accounts })),
    errorMessage => {
      console.error(errorMessage)
      return dispatch(propValueLoadingError({ prop: 'accounts', errorMessage }))
    }
  )
}

export const fetchTokenBalance = (account) => dispatch => {
  return client.tokenBalance(account).then(
    tokenBalance => dispatch(propValueLoaded({ prop: 'tokenBalance', value: tokenBalance })),
    errorMessage => {
      console.error(errorMessage)
      return dispatch(propValueLoadingError({ prop: 'tokenBalance', errorMessage }))
    }
  )
}

export const fetchInitData = () => async (dispatch, getState) => {
  await dispatch(fetchAccounts())
  await dispatch(fetchTokenBalance(getState().accounts[0]))
}
