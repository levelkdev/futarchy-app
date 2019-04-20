import '@babel/polyfill'
import _ from 'lodash'
import Aragon from '@aragon/api'
import { logDebug } from './util/logger'

const app = new Aragon()

const initialState = {
  events: []
}

app.store((state, event) => {
  if (state === null) state = initialState

  logDebug('app.store() EVENT: ', event)

  if (!_.find(state.events, { transactionHash: event.transactionHash })) {
    return {
      events: _.concat(state.events, event)
    }
  } else {
    return state
  }
})
