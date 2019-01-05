import _ from 'lodash'

const trades = (state = [], action) => {
  switch (action.type) {
    case 'BUY_MARKET_POSITIONS_EVENT':
      const { returnValues } = action
      const {
        decisionId,
        trader,
        tradeTime,
        collateralAmount,
        yesCosts,
        noCosts,
        yesPurchaseAmounts,
        noPurchaseAmounts
      } = returnValues
  
      const {
        lowerBound,
        upperBound
      } = action // lowerBound and upperBound are set by `appEventInterceptor` middleware

      const noTokenAmount = sumTokenValueArray(noPurchaseAmounts)
      const yesTokenAmount = sumTokenValueArray(yesPurchaseAmounts)
      const netYesCost = sumTokenValueArray(yesCosts)
      const netNoCost = sumTokenValueArray(noCosts)
      return [
        ...state,
        {
          decisionId,
          trader,
          tradeTime,
          tokenAmount: collateralAmount,
          netYesCost,
          netNoCost,
          noTokenName: `NO-${noPurchaseAmounts[0] == 0 ? 'LONG' : 'SHORT'}`,
          yesTokenName: `YES-${yesPurchaseAmounts[0] == 0 ? 'LONG' : 'SHORT'}`,
          noTokenAmount,
          yesTokenAmount,
          noTokenPrice: calcTokenPrice(netNoCost, noTokenAmount),
          yesTokenPrice: calcTokenPrice(netYesCost, yesTokenAmount),
          lowerBound,
          upperBound
        }
      ]
    default:
      return state
  }
}

export default trades

function calcTokenPrice(netCost, amount) {
  return parseInt(netCost) / parseInt(amount)
}

function sumTokenValueArray(tokenVals) {
  return parseInt(tokenVals[0]) + parseInt(tokenVals[1])
}
