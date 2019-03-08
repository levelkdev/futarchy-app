import React from 'react'
import { Button } from '@aragon/ui'

const ClaimReturnsForm = ({ decision, returnsAmount, claimReturns}) => (
  <div>
    <h1> Returns: {returnsAmount} TKN </h1>
    <Button
      mode='strong'
      onClick={ () => claimReturns(decision.decisionId) }
    >
      Claim Returns
    </Button>
  </div>
)

export default ClaimReturnsForm
