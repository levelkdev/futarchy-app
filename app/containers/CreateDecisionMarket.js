import React from 'react'
import { connect } from 'react-redux'
import { sendCreateDecisionMarket } from '../actions'
import { Button } from '@aragon/ui'

const question = 'Should we do this thing?'

const CreateDecisionMarket = ({ app, dispatch }) => {
  return (
    <Button onClick={() => {
      app.newDecision(question)
      dispatch(sendCreateDecisionMarket({ question }))
    }}>Create Decision</Button>
  )
}

export default connect()(CreateDecisionMarket)
