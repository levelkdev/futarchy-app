import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import decisionStatuses from '../constants/decisionStatuses'
import decisionLabels from '../constants/decisionLabels'
import AllDecisionsBadgeContainer from '../containers/AllDecisionsBadgeContainer'
import DecisionListContainer from '../containers/DecisionListContainer'

const Home = () => (
  <div>
    {_.values(decisionStatuses).map(decisionState => (
      <div key={decisionState}>
        <div>
          <div>
            {decisionLabels[decisionState]}
            <DecisionsCountBadge>
              <AllDecisionsBadgeContainer statusFilter={decisionState} />
            </DecisionsCountBadge>
          </div>
        </div>
      </div>
    ))}

    <DecisionListContainer />
  </div>
)

const DecisionsCountBadge = styled.span`
  margin-left: 15px;
`

export default Home
