import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import DecisionListEmptyState from './DecisionListEmptyState'
import DecisionMarket from './DecisionMarket'

const DecisionList = ({ decisions }) => (
  <div>
    {
      decisions.length == 0 ?
        <DecisionListEmptyState /> :
        <TileGroup>
          <DecisionTiles decisions={decisions} />
        </TileGroup>
    }
  </div>
)

const DecisionTiles = ({ decisions }) => decisions.map(decision => { console.log('KEY: ', decision.id); return (
  <LinkStyled
    to={`/decision/${decision.id}`}
    key={decision.id}
  >
    <Tile>
      <DecisionMarket decision={decision} />
    </Tile>
  </LinkStyled>
)})

const TileGroup = styled.div`
  display: flex;
`

const Tile = styled.div`
  min-width: 250px;
  background: white;
  border: 1px solid #e8e8e8;
  padding: 20px;
  margin-right: 20px;
`

const LinkStyled = styled(Link)`
  text-decoration: none;
`

export default DecisionList
