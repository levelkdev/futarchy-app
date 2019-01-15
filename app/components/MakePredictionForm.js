import React from 'react'
import { reduxForm } from 'redux-form'

const MakePredictionForm = ({ decision }) => (
  <div>
    <div>::Decision {decision.id}::</div>
    <div>{decision.question}</div>
  </div>
)

export default MakePredictionForm
