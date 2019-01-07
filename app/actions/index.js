import _ from 'lodash'
import client from '../client'

export const newDecisionTxPending = ({ question, txHash }) => ({
  type: 'NEW_DECISION_TX_PENDING',
  question,
  txHash
})

export const avgDecisionMarketPricesLoaded = ({ decisionId, yesMarketPrice, noMarketPrice }) => ({
  type: 'AVG_DECISION_MARKET_PRICES_LOADED',
  decisionId,
  yesMarketPrice,
  noMarketPrice
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

export const newDecision = (bytes32Script, question) => dispatch => {
  return client.newDecision(bytes32Script, question).then(txHash => {
    dispatch(newDecisionTxPending({ question, txHash }))
  }, err => {
    console.error(`newDecision: ${err}`)
    // TODO: dispatch error action, to show something to the user
  })
}

export const fetchAccounts = propFetchDispatcher('accounts')
export const fetchFutarchyAddress = propFetchDispatcher('futarchyAddress')
export const fetchFee = propFetchDispatcher('fee')
export const fetchTradingPeriod = propFetchDispatcher('tradingPeriod')
export const fetchMarketFundAmount = propFetchDispatcher('marketFundAmount')

export const fetchTokenBalance = (account) => dispatch => {
  return client.tokenBalance(account).then(
    tokenBalance => dispatch(propValueLoaded({ prop: 'tokenBalance', value: tokenBalance })),
    errorMessage => {
      console.error(errorMessage)
      return dispatch(propValueLoadingError({ prop: 'tokenBalance', errorMessage }))
    }
  )
}

export const fetchAvgPricesForDecisionMarkets = (decisionId) => dispatch => {
  return client.avgPricesForDecisionMarkets(decisionId).then(
    avgPrices => dispatch(avgDecisionMarketPricesLoaded({
      decisionId,
      yesMarketPrice: avgPrices.yesMarketPrice,
      noMarketPrice: avgPrices.noMarketPrice
    })),
    errorMessage => {
      console.error(`fetchAvgPricesForDecisionMarkets: ${errorMessage}`)
      // TODO: dispatch error action, to show something to the user
    }
  )
}

export const fetchInitData = () => async (dispatch, getState) => {
  await Promise.all([
    dispatch(fetchAccounts()),
    dispatch(fetchFutarchyAddress()),
    dispatch(fetchFee()),
    dispatch(fetchTradingPeriod()),
    dispatch(fetchMarketFundAmount())
  ])
  await dispatch(fetchTokenBalance(getState().accounts[0]))
}

function propFetchDispatcher (prop) {
  return () => dispatch => {
    return client[prop]().then(
      propValue => dispatch(propValueLoaded({ prop, value: propValue })),
      errorMessage => {
        console.error(errorMessage)
        return dispatch(propValueLoadingError({ prop, errorMessage }))
      }
    )
  }
}
