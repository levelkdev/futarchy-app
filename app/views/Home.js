import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import decisionStatuses from '../constants/decisionStatuses'
import decisionLabels from '../constants/decisionLabels'
import AllDecisionsBadgeContainer from '../containers/AllDecisionsBadgeContainer'
import DecisionDisplayContainer from '../containers/DecisionDisplayContainer'

const Home = () => (
  <div>
    <DecisionDisplayContainer />
  </div>
)

const DecisionsCountBadge = styled.span`
  margin-left: 15px;
`

const MarketCardSectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
`

const MarketCardSection = styled.div`
  margin-bottom: 20px;
`

export default Home
