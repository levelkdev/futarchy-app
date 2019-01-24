import React from 'react'
import styled from 'styled-components'
import DecisionListEmptyState from './DecisionListEmptyState'
import DecisionCard from './DecisionCard'

const DecisionList = ({ decisions }) => (
  <div>
    {
      decisions.length == 0 ?
        <DecisionListEmptyState /> :
        <CardGroup>
          <DecisionCards decisions={decisions} />
        </CardGroup>
    }
  </div>
)

const DecisionCards = ({ decisions }) => decisions.map(decision => (
  <Card>
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
