import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Button } from '@aragon/ui'

const createReduxForm = reduxForm({ form: 'createDecisionMarket' })

const CreateDecisionMarket = createReduxForm(({ handleSubmit, createDecision }) => (
  <form onSubmit={handleSubmit(createDecision)}>
    <div>
      <label htmlFor="queston">Question:</label>
      <Field name="question" component="input" type="text" />
    </div>
    <div>
      <Button type="submit">Create Decision</Button>
    </div>
  </form>
))

export default CreateDecisionMarket
