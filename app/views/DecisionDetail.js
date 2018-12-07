import React from 'react'
import { Link } from 'react-router-dom'
import DecisionSummaryContainer from '../containers/DecisionSummaryContainer'

const DecisionDetail = ({ match }) => (
  <div>
    <Link to="/">&lt;&lt;&lt; Back</Link>
    <br /><br />
    <DecisionSummaryContainer decisionId={match.params.decisionId} />
  </div>
)

export default DecisionDetail
