import { combineReducers } from 'redux'
import { appEvents } from '../aragonRedux/aragonRedux'
import decisionMarkets from './decisionMarkets'

export default combineReducers({
  appEvents,
  decisionMarkets
})
