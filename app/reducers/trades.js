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
        yesShortTokenAmount,
        yesLongTokenAmount,
        noShortTokenAmount,
        noLongTokenAmount
      } = returnValues
      return [
        ...state,
        {
          decisionId,
          trader,
          tradeTime,
          tokenAmount,
          noTokenName: `NO-${noShortTokenAmount == 0 ? 'LONG' : 'SHORT'}`,
          yesTokenName: `YES-${yesShortTokenAmount == 0 ? 'LONG' : 'SHORT'}`,
          noTokenAmount: noShortTokenAmount == 0 ? noLongTokenAmount : noShortTokenAmount,
          yesTokenAmount: yesShortTokenAmount == 0 ? yesLongTokenAmount : yesShortTokenAmount
        }
      ]
    default:
      return state
  }
}

export default trades
