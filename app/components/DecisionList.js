import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
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
  <LinkStyled
    to={`/decision/${decision.id}`}
    key={decision.id}
  >
    <Card>
      <DecisionCard decision={decision} />
    </Card>
  </LinkStyled>
))

const CardGroup = styled.div`
  display: flex;
`

const Card = styled.div`
  min-width: 300px;
  margin-right: 20px;
`

const LinkStyled = styled(Link)`
  text-decoration: none;
`

export default DecisionList
