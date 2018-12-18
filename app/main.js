import '@babel/polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import aragonClient from './aragonClient'
import { aragonReduxMiddleware, subscribeToAppState } from './aragonRedux/aragonRedux'
import rootReducer from './reducers'
import clientTransactions from './middleware/clientTransactions'
import App from './App'

// log all messages from the client, throw if message contains an error
aragonClient.rpc.provider.messages().subscribe(payload => {
  console.log('Aragon client message: ', payload)
  if (payload && payload.error) {
    throw new Error(`Aragon client error: ${payload.error}`)
  }
})

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunk,
    aragonReduxMiddleware,
    clientTransactions
  )
)

class ConnectedApp extends React.Component {
  state = {
    app: aragonClient,
    observable: null,
    userAccount: '',
  }
  componentDidMount() {
    window.addEventListener('message', this.handleWrapperMessage)

    // If using Parcel, reload instead of using HMR.
    // HMR makes the app disconnect from the wrapper and the state is empty until a reload
    // See: https://github.com/parcel-bundler/parcel/issues/289
    if (module.hot) {
      module.hot.dispose(() => {
        window.location.reload();
      })
    }
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.handleWrapperMessage)
  }
  // handshake between Aragon Core and the iframe,
  // since iframes can lose messages that were sent before they were ready
  handleWrapperMessage = ({ data }) => {
    if (data.from !== 'wrapper') {
      return
    }
    if (data.name === 'ready') {
      const { app } = this.state

      this.sendMessageToWrapper('ready', true)

      store.dispatch(subscribeToAppState(app))

      app.accounts().subscribe(accounts => {
        // TODO: dispatch redux action here instead of setState
        this.setState({
          userAccount: accounts[0],
        })
      })
    }
  }
  sendMessageToWrapper = (name, value) => {
    window.parent.postMessage({ from: 'app', name, value }, '*')
  }
  render() {
    return (
      <Provider store={store}>
        <App {...this.state} />
      </Provider>
    )
  }
}
ReactDOM.render(
  <ConnectedApp />,
  document.getElementById('root')
)
