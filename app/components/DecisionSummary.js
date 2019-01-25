import React from 'react'

const DecisionSummary = ({ decision }) => (
  <div>
    <div>::Decision {decision.decisionId}::</div>
    <div>{decision.question}</div>
  </div>
)

export default DecisionSummary
