import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Text
} from '@aragon/ui'
import DecisionsTableRows from './DecisionsTableRows'
import DecisionQuestionLinkContainer from '../../containers/DecisionQuestionLinkContainer'
import DecisionResolveTimeContainer from '../../containers/DecisionResolveTimeContainer'
import DecisionCloseTimeContainer from '../../containers/DecisionCloseTimeContainer'
import DecisionResultContainer from '../../containers/DecisionResultContainer'
import DecisionAmountRiskedContainer from '../../containers/DecisionAmountRiskedContainer'
import DecisionWinningMarketReturnsContainer from '../../containers/DecisionWinningMarketReturnsContainer'
import DecisionWinningMarketGainLossContainer from '../../containers/DecisionWinningMarketGainLossContainer'
import DecisionRealizedGainLossContainer from '../../containers/DecisionRealizedGainLossContainer'
import ShowPanelButtonContainer from '../../containers/ShowPanelButtonContainer'

const ResolvedDecisionsTable = ({ decisionIds }) => (
  <Table
    header={
      <TableRow>
        <TableHeader title="Question" />
        <TableHeader title="Resolved" />
        <TableHeader title="Closes" />
        <TableHeader title="Decision" />
        <TableHeader title="You Risked" />
        <TableHeader title="Returns" />
        <TableHeader title="Realized Gain/Loss" />
        <TableHeader title="Current Gain/Loss" />
        <TableHeader title="Actions" />
      </TableRow>
    }
  >
    <DecisionsTableRows columnCount={8}>
      {decisionIds.map(decisionId => (
        <TableRow key={decisionId}>
          <TopAlignedCell>
            <DecisionQuestionLinkContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <DecisionResolveTimeContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <DecisionCloseTimeContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <DecisionResultContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <DecisionAmountRiskedContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <DecisionWinningMarketReturnsContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <DecisionRealizedGainLossContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <DecisionWinningMarketGainLossContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <ShowPanelButtonContainer
              panelName="claimReturns"
              panelContext={{ decisionId }}
            >
              Claim Returns
            </ShowPanelButtonContainer >
          </TopAlignedCell>
        </TableRow>
      ))}
    </DecisionsTableRows>
  </Table>
)

const TopAlignedCell = styled(TableCell)`
  vertical-align: top;
`

export default ResolvedDecisionsTable
