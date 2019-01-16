import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import decisionStatuses from '../constants/decisionStatuses'
import PerformanceTotalsContainer from '../containers/PerformanceTotalsContainer'
import MyDecisionsBadgeContainer from '../containers/MyDecisionsBadgeContainer'
import OpenDecisionsTable from '../components/decisionTables/OpenDecisionsTable'
import ResolvedDecisionsTable from '../components/decisionTables/ResolvedDecisionsTable'
import ClosedDecisionsTable from '../components/decisionTables/ClosedDecisionsTable'

const decisionStateMap = {
  OPEN: { label: 'My Open Decisions', component: OpenDecisionsTable },
  RESOLVED: { label: 'My Resolved Decisions', component: ResolvedDecisionsTable },
  CLOSED: { label: 'My Closed Decisions', component: ClosedDecisionsTable }
}

const Account = () => (
  <ViewElem>
    <TableTitle>My Totals</TableTitle>
    <PerformanceTotalsContainer />
    <br /><br />

    {_.values(decisionStatuses).map(decisionState => {
      const { label, component: DecisionTableComponent } = decisionStateMap[decisionState]
      return (
        <DecisionSummarySection>
          <div>
            <TableTitle>
              {label}
              <DecisionsCountBadge>
                <MyDecisionsBadgeContainer statusFilter={decisionState} />
              </DecisionsCountBadge>
            </TableTitle>
          </div>
          {<DecisionTableComponent />}
        </DecisionSummarySection>
      )
    })}

  </ViewElem>
)

const ViewElem = styled.div`
  width: 100%;
`

const DecisionsCountBadge = styled.span`
  margin-left: 15px;
`

const DecisionSummarySection = styled.div`
  margin-bottom: 65px;
`

const TableTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
`

export default Account
