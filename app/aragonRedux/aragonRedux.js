import _ from 'lodash'

export const differenceWithEvents = (initialEventState, finalEventState) => {
  return _.differenceWith(finalEventState, initialEventState, (a, b) => {
    return a.transactionHash == b.transactionHash
  })
}

export const aragonReduxMiddleware = store => next => action => {
  const initialEventState = store.getState().appEvents
  let result = next(action)
  if (action.type == 'UPDATE_APP_EVENTS') {
    const newEvents = differenceWithEvents(
      initialEventState,
      store.getState().appEvents
    )
    newEvents.forEach(event => {
      store.dispatch({
        ...event,
        ...{ type: pascalToUpperSnake(event.event) }
      })
    })
  }
  return result
}

export const updateAppEvents = (events) => ({
  type: 'UPDATE_APP_EVENTS',
  events
})

export const subscribeToAppState = app => (dispatch, getState) => {
  return new Promise(resolve => {
    app.state().subscribe(stateData => {
      if (stateData && stateData.events) {
        dispatch(updateAppEvents(stateData.events))
      }
    })
    resolve()
  })
}

export const appEvents = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_APP_EVENTS':
      return action.events
    default:
      return state
  }
}

// converts PascalCase to UPPER_SNAKE_CASE
// example SomethingToConvert => SOMETHING_TO_CONVERT
export const pascalToUpperSnake = s => {
  return s.replace(
    /\.?([A-Z]+)/g,
    function (x, y) {
      return '_' + y.toLowerCase()
    }
  ).replace(/^_/, '').toUpperCase()
}
