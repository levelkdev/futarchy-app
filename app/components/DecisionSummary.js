import React from 'react'

const DecisionSummary = ({ decision }) => (
  <div>
    <div>::Decision {decision.id}::</div>
    <div>{decision.question}</div>
  </div>
)

export default DecisionSummary
