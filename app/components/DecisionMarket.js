import React from 'react'

const DecisionMarket = ({ pending, id, question }) => (
  <div>
    {
      pending ?
        <div>Transaction pending...</div> :
        <div>ID: {id}</div>
    }
    <div>QUESTION: {question}</div>
    <br /><br />
  </div>
)

export default DecisionMarket
