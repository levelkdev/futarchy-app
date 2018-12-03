import React from 'react'
import DecisionMarket from './DecisionMarket'

const DecisionMarketList = ({ decisionMarkets }) => (
  <div>
    <div>Decisions:</div>
    <div>
      {decisionMarkets.map(decisionMarket => (
        <DecisionMarket
          key={decisionMarket.id}
          {...decisionMarket}
        />
      ))}
    </div>
  </div>
)

export default DecisionMarketList
