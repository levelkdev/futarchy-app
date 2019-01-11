import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'
import { appEvents } from '../aragonRedux/aragonRedux'
import decisionMarkets from './decisionMarkets'
import sidePanel from './sidePanel'
import propValue from './propValue'
import initDataLoadStates from './initDataLoadStates'
import initDataProps from './initDataProps'
import performance from './performance'
import trades from './trades'

let reducers = {
  appEvents,
  decisionMarkets,
  form,
  sidePanel,
  initDataLoadStates,
  performance,
  trades
}

initDataProps.forEach(val => {
  reducers[val.prop] = propValue({
    prop: val.prop,
    defaultValue: val.defaultValue
  })
})

export default combineReducers(reducers)
