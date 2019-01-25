import React from 'react'
import DecisionTradeListContainer from '../containers/DecisionTradeListContainer'

const DecisionTrades = ({ match }) => (
  <div>
    <DecisionTradeListContainer decisionId={match.params.decisionId} />
  </div>
)

export default DecisionTrades
