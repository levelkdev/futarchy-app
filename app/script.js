import '@babel/polyfill'

import Aragon from '@aragon/client'

const app = new Aragon()

const initialState = {
  count: 0
}
app.store(async (state, event) => {
  if (state === null) state = initialState

  switch (event.event) {
    case 'DecisionCreated':
      return { count: await getDecisionsCount() }
    default:
      return state
  }
})

function getDecisionsCount() {
  return new Promise(resolve => {
    app
      .call('decisionCount')
      .first()
      .subscribe(resolve)
  })
}
