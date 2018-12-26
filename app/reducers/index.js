import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'
import { appEvents } from '../aragonRedux/aragonRedux'
import decisionMarkets from './decisionMarkets'
import sidePanel from './sidePanel'
import propValue from './propValue'
import initDataLoadStates from './initDataLoadStates'

export default combineReducers({
  appEvents,
  decisionMarkets,
  form,
  sidePanel,
  accounts: propValue({
    prop: 'accounts',
    defaultValue: []
  }),
  tokenBalance: propValue({
    prop: 'tokenBalance',
    defaultValue: []
  }),
  initDataLoadStates
})
