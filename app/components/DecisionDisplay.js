import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import decisionStatuses from '../constants/decisionStatuses'
import decisionLabels from '../constants/decisionLabels'
import AllDecisionsBadgeContainer from '../containers/AllDecisionsBadgeContainer'
import DecisionListContainer from '../containers/DecisionListContainer'
import DecisionListEmptyState from './DecisionListEmptyState'


const DecisionDisplay = ({ decisionCount }) => {
  return (
    <div>
      { decisionCount == 0 ? <DecisionListEmptyState /> : <SortedDecisionLists /> }
    </div>
  )
}

const SortedDecisionLists = () => (
  _.values(decisionStatuses).map(decisionState => (
    <div key={decisionState}>
      <MarketCardSection>
        <MarketCardSectionTitle>
          {decisionLabels[decisionState]}
          <DecisionsCountBadge>
            <AllDecisionsBadgeContainer statusFilter={decisionState} />
          </DecisionsCountBadge>
        </MarketCardSectionTitle>

        <DecisionListContainer statusFilter={decisionState} />
      </MarketCardSection>
    </div>
  ))
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

export default DecisionDisplay
