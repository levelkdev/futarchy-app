import React from 'react'
import { Info } from '@aragon/ui'
import _ from 'lodash'
import styled from 'styled-components'
import decisionStatuses from '../constants/decisionStatuses'
import decisionLabels from '../constants/decisionLabels'
import PerformanceTotalsContainer from '../containers/PerformanceTotalsContainer'
import MyDecisionsBadgeContainer from '../containers/MyDecisionsBadgeContainer'
import DecisionsTableContainer from '../containers/DecisionsTableContainer'

const Positions = ({ match }) => (
  <ViewElem>
    {match.params.account == "undefined" ? <AccountError /> : <PositionsTables />}
  </ViewElem>
)

const AccountError = () => (
  <Info.Alert title="Please log into MetaMask">
    To view your positions, make sure you are logged into MetaMask.
  </Info.Alert>
)

const PositionsTables = () => (
  <div>
    <TableTitle>My Totals</TableTitle>
    <PerformanceTotalsContainer />
    <br /><br />

    {_.values(decisionStatuses).map(decisionState => (
      <DecisionSummarySection key={decisionState}>
        <div>
          <TableTitle>
            {decisionLabels[decisionState]}
            <DecisionsCountBadge>
              <MyDecisionsBadgeContainer statusFilter={decisionState} />
            </DecisionsCountBadge>
          </TableTitle>
        </div>
        <DecisionsTableContainer statusFilter={decisionState} />
      </DecisionSummarySection>
    ))}
  </div>
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

export default Positions
