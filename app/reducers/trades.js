import _ from 'lodash'

const trades = (state = [], action) => {
  switch (action.type) {
    case 'DEBUG_TRADE_EVENT':
      const { returnValues } = action
      const {
        decisionId,
        trader,
        tradeTime,
        tokenAmount,
        netYesCost,
        netNoCost,
        yesShortTokenAmount,
        yesLongTokenAmount,
        noShortTokenAmount,
        noLongTokenAmount
      } = returnValues
      const noTokenAmount = noShortTokenAmount == 0 ? noLongTokenAmount : noShortTokenAmount
      const yesTokenAmount = yesShortTokenAmount == 0 ? yesLongTokenAmount : yesShortTokenAmount
      return [
        ...state,
        {
          decisionId,
          trader,
          tradeTime,
          tokenAmount,
          netYesCost,
          netNoCost,
          noTokenName: `NO-${noShortTokenAmount == 0 ? 'LONG' : 'SHORT'}`,
          yesTokenName: `YES-${yesShortTokenAmount == 0 ? 'LONG' : 'SHORT'}`,
          noTokenAmount,
          yesTokenAmount,
          noTokenPrice: calcTokenPrice(netNoCost, noTokenAmount),
          yesTokenPrice: calcTokenPrice(netYesCost, yesTokenAmount),
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
