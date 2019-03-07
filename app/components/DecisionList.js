import React from 'react'
import styled from 'styled-components'
import DecisionCard from './DecisionCard'

const DecisionList = ({ decisions }) => (
  <div>
    <CardGroup>
      <DecisionCards decisions={decisions} />
    </CardGroup>
  </div>
)

const DecisionCards = ({ decisions }) => decisions.map(decision => (
  <Card key={decision.decisionId}>
    <DecisionCard decision={decision} />
  </Card>
))

const CardGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const Card = styled.div`
  width: 340px;
  margin-right: 20px;
`

export default DecisionList
