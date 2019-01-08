import React from 'react'
import MarketCircles from './MarketCircles'

const DecisionMarket = ({ decision }) => (
  <div>
    {
      decision.pending ?
        <div>Transaction pending...</div> :
        <div>ID: {decision.id}</div>
    }
    <div>{decision.question}</div>
    <br /><br />
    <div>YES: {decision.yesMarketPredictedPrice}</div>
    <div>NO: {decision.noMarketPredictedPrice}</div>
    <br /><br />
    <MarketCircles
      yesDisplayPrice={decision.yesMarketPredictedPrice}
      noDisplayPrice={decision.noMarketPredictedPrice}
      yesPercentage={decision.yesMarketPrice}
      noPercentage={decision.noMarketPrice} />
  </div>
)

export default DecisionMarket
