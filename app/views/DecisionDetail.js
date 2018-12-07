import React from 'react'
import DecisionSummaryContainer from '../containers/DecisionSummaryContainer'

const DecisionDetail = ({ match }) => (
  <div>
    <DecisionSummaryContainer decisionId={match.params.decisionId} />
  </div>
)

export default DecisionDetail
