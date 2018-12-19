import _ from 'lodash'
import sendTransaction from '../client/sendTransaction'

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

export const newDecision = (bytes32Script, question) => dispatch => {
  return sendTransaction('newDecision', [bytes32Script, question]).then(txHash => {
    dispatch(newDecisionTxPending({ question, txHash }))
  }, err => {
    // TODO: dispatch error action, to show something to the user
  })
}
