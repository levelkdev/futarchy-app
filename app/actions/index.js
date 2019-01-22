import _ from 'lodash'
import client from '../client'

export const newDecisionTxPending = ({ question, txHash }) => ({
  type: 'NEW_DECISION_TX_PENDING',
  question,
  txHash
})

export const buyMarketPositionsTxPending = ({ txHash }) => ({
  type: 'BUY_MARKET_POSITIONS_TX_PENDING',
  txHash
})

export const avgDecisionMarketPricesLoaded = ({ decisionId, yesMarketPrice, noMarketPrice }) => ({
  type: 'AVG_DECISION_MARKET_PRICES_LOADED',
  decisionId,
  yesMarketPrice,
  noMarketPrice
})

export const potentialProfitDataLoaded = ({
  decisionId,
  trader,
  yesShort,
  yesLong,
  noShort,
  noLong
}) => ({
  type: 'POTENTIAL_PROFIT_DATA_LOADED',
  decisionId,
  trader,
  yesShort,
  yesLong,
  noShort,
  noLong
})

export const showPanel = ({ panelName, panelContext }) => ({
  type: 'SHOW_PANEL',
  panelName,
  panelContext
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

export const fetchTraderDecisionBalancesPending = ({ decisionId, trader }) => ({
  type: 'FETCH_TRADER_DECISION_BALANCES_PENDING',
  decisionId,
  trader
})

export const fetchTraderDecisionBalancesSuccess = ({
  decisionId,
  trader, 
  yesCollateral,
  noCollateral,
  yesShort,
  yesLong,
  noShort,
  noLong
}) => ({
  type: 'FETCH_TRADER_DECISION_BALANCES_SUCCESS',
  decisionId,
  trader, 
  yesCollateral,
  noCollateral,
  yesShort,
  yesLong,
  noShort,
  noLong
})

export const newDecision = ({
  bytes32Script,
  question,
  lowerBound,
  upperBound
}) => dispatch => {
  return client.newDecision(bytes32Script, question, lowerBound, upperBound).then(txHash => {
    dispatch(newDecisionTxPending({ question, txHash }))
  }, err => {
    console.error(`newDecision: ${err}`)
    // TODO: dispatch error action, to show something to the user
  })
}

export const buyMarketPositions = ({
  decisionId,
  collateralAmount,
  yesPurchaseAmounts,
  noPurchaseAmounts
}) => dispatch => {
  return client.buyMarketPositions(decisionId, collateralAmount, yesPurchaseAmounts, noPurchaseAmounts).then(txHash => {
    dispatch(buyMarketPositionsTxPending({ txHash }))
  }, err => {
    console.error(`buyMarketPositions: ${err}`)
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

export const fetchTraderDecisionBalances = ({ decisionId, trader }) => dispatch => {
  dispatch(fetchTraderDecisionBalancesPending({ decisionId, trader }))
  return client.traderDecisionBalances(decisionId, trader).then(
    balances => {
      dispatch(fetchTraderDecisionBalancesSuccess({
        decisionId,
        trader,
        ...balances
      }))
    },
    errorMessage => {
      console.error(`fetchTraderDecisionBalances: ${errorMessage}`)
      // TODO: dispatch error action, to show something to the user
    }
  )
}

// fetches the amount of collateral token a trader would receive if they sold
// outcome tokens for a given decision, and dispatches an action
// `balances` expects an array: [yesShort, yesLong, noShort, noLong]
export const fetchPotentialProfitData = ({ decisionId, trader, balances }) => dispatch => {
  return client.calcProfits(decisionId, balances).then(
    profits => dispatch(potentialProfitDataLoaded({
      decisionId,
      trader,
      yesShort: profits.yesShort,
      yesLong: profits.yesLong,
      noShort: profits.noShort,
      noLong: profits.noLong
    })),
    errorMessage => {
      console.error(`fetchPotentialProfitData: ${errorMessage}`)
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
