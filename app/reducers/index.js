import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'
import { appEvents } from '../aragonRedux/aragonRedux'
import decisionMarkets from './decisionMarkets'
import sidePanel from './sidePanel'

export default combineReducers({
  appEvents,
  decisionMarkets,
  form,
  sidePanel
})
