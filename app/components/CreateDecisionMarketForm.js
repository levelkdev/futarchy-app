import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Button } from '@aragon/ui'
import formatBalance from '../util/formatBalance'

const createReduxForm = reduxForm({ form: 'createDecisionMarket' })

const CreateDecisionMarketForm = createReduxForm(({
  tokenBalance,
  marketFundAmount,
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
      <div>
        Funding required: <b>{formatBalance(marketFundAmount)} TKN</b>
      </div>
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
