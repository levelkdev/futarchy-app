import React from 'react'
import { Button } from '@aragon/ui'

const ClaimReturnsForm = ({ decision, returnsAmount, claimReturns}) => (
  <div>
    <h1> Decision {decisionStateText(decision)} </h1>
    <h1> Returns: {returnsAmount} TKN </h1>
    <Button
      mode='strong'
      onClick={ () => claimReturns(decision.decisionId) }
    >
      Claim Returns
    </Button>
  </div>
)

const decisionStateText = (decision) => {
  const resolvedDecisionText = decisionPassed => decisionPassed ? 'Passed' : 'Failed'
  return !decision.resolved ? 'Unresolved' : resolvedDecisionText(decision.passed)
}

export default ClaimReturnsForm
