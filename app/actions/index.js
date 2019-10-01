import _ from 'lodash'
import decisionById from '../reducers/computed/decisionById'
import calcOutcomeTokenPurchaseAmounts from '../util/calcOutcomeTokenPurchaseAmounts'
import client from '../client'
import toWei from '../util/toWei'

export const newDecisionTxPending = ({ question, txHash }) => ({
  type: 'NEW_DECISION_TX_PENDING',
  question,
  txHash
})

export const buyMarketPositionsTxPending = ({ txHash }) => ({
  type: 'BUY_MARKET_POSITIONS_TX_PENDING',
  txHash
})

export const redeemWinningsTxPending = ({ txHash }) => ({
  type: 'REDEEM_WINNINGS_TX_PENDING',
  txHash
})

export const avgDecisionMarketPricesLoaded = ({
  decisionId,
  yesMarketAveragePricePercentage,
  noMarketAveragePricePercentage
}) => ({
  type: 'AVG_DECISION_MARKET_PRICES_LOADED',
  decisionId,
  yesMarketAveragePricePercentage,
  noMarketAveragePricePercentage
})

export const netOutcomeTokensSoldForDecisionLoaded = ({ decisionId, marketIndex, shortOutcomeTokensSold, longOutcomeTokensSold }) => ({
  type: 'NET_OUTCOME_TOKENS_SOLD_FOR_DECISION_LOADED',
  decisionId,
  marketIndex,
  shortOutcomeTokensSold,
  longOutcomeTokensSold
})

export const yesNoMarketDataLoaded = ({
  decisionId,
  yesMarketFee,
  noMarketFee,
  yesMarketFunding,
  noMarketFunding,
  yesShortOutcomeTokensSold,
  yesLongOutcomeTokensSold,
  noShortOutcomeTokensSold,
  noLongOutcomeTokensSold
}) => ({
  type: 'YES_NO_MARKET_DATA_LOADED',
  decisionId,
  yesMarketFee,
  noMarketFee,
  yesMarketFunding,
  noMarketFunding,
  yesShortOutcomeTokensSold,
  yesLongOutcomeTokensSold,
  noShortOutcomeTokensSold,
  noLongOutcomeTokensSold
})

export const decisionDataLoaded = ({ decisionId, decisionData }) => ({
  type: 'DECISION_DATA_LOADED',
  decisionData,
  decisionId
})

export const marginalPricesLoaded = ({ decisionId, yesMarketMarginalPricePercentage, noMarketMarginalPricePercentage }) => ({
  type: 'MARGINAL_PRICES_LOADED',
  decisionId,
  yesMarketMarginalPricePercentage,
  noMarketMarginalPricePercentage
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
  yesOutcomeTokenIndex, // 0 = SHORT, 1 = LONG, null = none
  noOutcomeTokenIndex // 0 = SHORT, 1 = LONG, null = none
}) => (dispatch, getState) => {
  const decision = decisionById(getState().decisionMarkets, decisionId)

  return client.buyMarketPositions(
    decisionId,
    collateralAmount,

    // YES market SHORT/LONG amounts
    calcOutcomeTokenPurchaseAmounts({
      outcomeTokenIndex: yesOutcomeTokenIndex,
      collateralAmount: toWei(collateralAmount, 'ether'),
      outcomeTokenIndex: yesOutcomeTokenIndex,
      shortOutcomeTokensSold: decision.yesShortOutcomeTokensSold,
      longOutcomeTokensSold: decision.yesLongOutcomeTokensSold,
      funding: decision.yesMarketFunding,
      feeFactor: decision.yesMarketFee
    }),

    // NO market SHORT/LONG amounts
    calcOutcomeTokenPurchaseAmounts({
      outcomeTokenIndex: noOutcomeTokenIndex,
      collateralAmount: toWei(collateralAmount, 'ether'),
      outcomeTokenIndex: noOutcomeTokenIndex,
      shortOutcomeTokensSold: decision.noShortOutcomeTokensSold,
      longOutcomeTokensSold: decision.noLongOutcomeTokensSold,
      funding: decision.noMarketFunding,
      feeFactor: decision.noMarketFee
    })
  ).then(txHash => {
    dispatch(buyMarketPositionsTxPending({ txHash }))
  }, err => {
    console.error(`buyMarketPositions: ${err}`)
    // TODO: dispatch error action, to show something to the user
  })
}

export const redeemWinnings = (
  decisionId
) => dispatch => {
  return client.redeemWinnings(decisionId).then(txHash => {
    dispatch(redeemWinningsTxPending({txHash}))
  }, err => {
    console.error(`redeemWinnings: ${err}`)
    // TODO: dispatch error action, to show something to the user
  })
}

export const fetchAccounts = propFetchDispatcher('accounts')
export const fetchFutarchyAddress = propFetchDispatcher('futarchyAddress')
export const fetchLatestBlock = propFetchDispatcher('latestBlock')
export const fetchFee = propFetchDispatcher('fee')
export const fetchTradingPeriod = propFetchDispatcher('tradingPeriod')
export const fetchMarketFundAmount = propFetchDispatcher('marketFundAmount')

export const fetchTokenData = (account) => dispatch => {
  return client.tokenData(account).then(
    token => {
      dispatch(propValueLoaded({prop: 'tokenSymbol', value: token.symbol }))
      dispatch(propValueLoaded({ prop: 'tokenBalance', value: token.balance }))
    },
    errorMessage => {
      console.error(errorMessage)
      return dispatch(propValueLoadingError({ prop: 'tokenBalance', errorMessage }))
    }
  )
}

export const fetchYesNoMarketData = ({ decisionId, futarchyOracleAddress }) => dispatch => {
  return client.yesNoMarketData(futarchyOracleAddress).then(marketData => {
    const {
      yesMarketFee,
      noMarketFee,
      yesMarketFunding,
      noMarketFunding,
      yesAveragePrice,
      noAveragePrice,
      yesShortOutcomeTokensSold,
      yesLongOutcomeTokensSold,
      noShortOutcomeTokensSold,
      noLongOutcomeTokensSold
    } = marketData
    // TODO: these don't really need to be separate actions, but tests are already in
    //       place and avgDecisionMarketPricesLoaded works to correctly render the values
    //       in the market circles. could be refactored at some point.
    dispatch(avgDecisionMarketPricesLoaded({
      decisionId,
      yesMarketAveragePricePercentage: yesAveragePrice,
      noMarketAveragePricePercentage: noAveragePrice
    }))
    dispatch(yesNoMarketDataLoaded({
      decisionId,
      yesMarketFee,
      noMarketFee,
      yesMarketFunding,
      noMarketFunding,
      yesShortOutcomeTokensSold,
      yesLongOutcomeTokensSold,
      noShortOutcomeTokensSold,
      noLongOutcomeTokensSold
    }))
  },
  errorMessage => {
    console.error(`fetchYesNoMarketData: ${errorMessage}`)
    // TODO: dispatch error action, to show something to the user
  })
}

export const fetchMarginalPrices = ({ decisionId }) => dispatch => {
  return client.calcMarginalPrices(decisionId).then(marginalPrices => {
    // index 1 = YES_LONG, index 3 = NO_LONG
    dispatch(marginalPricesLoaded({
      decisionId,
      yesMarketMarginalPricePercentage: marginalPrices[1],
      noMarketMarginalPricePercentage: marginalPrices[3]
    }))
  },
  errorMessage => {
    console.error(`fetchMarginalPrices: ${errorMessage}`)
    // TODO: dispatch error action, to show something to the user
  })
}

export const fetchDecisionData = (decisionId) => dispatch => {
  return client.decisions(decisionId).then(
    decisionData => {
      dispatch(fetchYesNoMarketData({
        decisionId,
        futarchyOracleAddress: decisionData.futarchyOracle
      }))
      dispatch(fetchMarginalPrices({
        decisionId
      }))
      dispatch(decisionDataLoaded({ decisionId, decisionData }))
    }
  )
}

export const fetchNetOutcomeTokensSoldForDecision = (decisionId, marketIndex) => dispatch => {
  return client.netOutcomeTokensSoldForDecision(decisionId, marketIndex).then(
    outcomeTokensSold => dispatch(netOutcomeTokensSoldForDecisionLoaded({
      decisionId,
      marketIndex,
      shortOutcomeTokensSold: outcomeTokensSold.shortOutcomeTokensSold,
      longOutcomeTokensSold: outcomeTokensSold.longOutcomeTokensSold
    })),
    errorMessage => {
      console.error('fetchNetOutcomeTokensSoldForDecision: ${errorMessage}')
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

export const fetchInitData = () => async (dispatch, getState) => {
  await Promise.all([
    dispatch(fetchAccounts()),
    dispatch(fetchLatestBlock()),
    dispatch(fetchFutarchyAddress()),
    dispatch(fetchFee()),
    dispatch(fetchTradingPeriod()),
    dispatch(fetchMarketFundAmount())
  ])
  await dispatch(fetchTokenData(getState().accounts[0]))
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
