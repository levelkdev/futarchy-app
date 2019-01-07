import React from 'react'

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
  </div>
)

export default DecisionMarket
