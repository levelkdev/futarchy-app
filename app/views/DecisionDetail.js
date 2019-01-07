import React from 'react'
import DecisionSummaryContainer from '../containers/DecisionSummaryContainer'
import DecisionTradeListContainer from '../containers/DecisionTradeListContainer'

const DecisionDetail = ({ match }) => (
  <div>
    <DecisionSummaryContainer decisionId={match.params.decisionId} />
    <DecisionTradeListContainer decisionId={match.params.decisionId} />
  </div>
)

export default DecisionDetail
