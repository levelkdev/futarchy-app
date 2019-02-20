import calcOutcomeTokenCount from './pmJS/calcOutcomeTokenCount'

const calcOutcomeTokenPurchaseAmounts = ({
  collateralAmount,
  outcomeTokenIndex,
  shortOutcomeTokensSold,
  longOutcomeTokensSold,
  funding,
  feeFactor
}) => {
  let outcomeTokenPurchaseAmounts = [0, 0]
  if (outcomeTokenIndex !== null) {
    outcomeTokenPurchaseAmounts[outcomeTokenIndex] = calcOutcomeTokenCount({
      netOutcomeTokensSold: [shortOutcomeTokensSold, longOutcomeTokensSold],
      funding,
      outcomeTokenIndex,
      cost: collateralAmount,
      feeFactor
    }).toString()
  }
  return outcomeTokenPurchaseAmounts
}

export default calcOutcomeTokenPurchaseAmounts
