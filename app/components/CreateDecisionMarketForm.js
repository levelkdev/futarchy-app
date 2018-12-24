import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Button } from '@aragon/ui'
import formatBalance from '../util/formatBalance'

const createReduxForm = reduxForm({ form: 'createDecisionMarket' })

const CreateDecisionMarketForm = createReduxForm(({
  tokenBalance,
  handleSubmit,
  createDecision
}) => (
  <form onSubmit={handleSubmit(createDecision)}>
    <div>
      <label htmlFor="queston">Question:</label>
      <Field name="question" component="input" type="text" />
    </div>
    <br /><br />
    <div>
      <label htmlFor="fundingAmount">Funding Amount:</label>
      <Field name="fundingAmount" component="input" type="text" />
      <div>
        Your balance: <b>{formatBalance(tokenBalance)} TKN</b>
      </div>
    </div>
    <br /><br />
    <div>
      <Button type="submit">Create Decision</Button>
    </div>
  </form>
))

export default CreateDecisionMarketForm
