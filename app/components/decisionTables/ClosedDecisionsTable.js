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
import DecisionPredictedPricesContainer from '../../containers/DecisionPredictedPricesContainer'
import DecisionAmountRiskedContainer from '../../containers/DecisionAmountRiskedContainer'
import DecisionPotentialValuesContainer from '../../containers/DecisionPotentialValuesContainer'
import DecisionPotentialGainLossContainer from '../../containers/DecisionPotentialGainLossContainer'
import ShowPanelButtonContainer from '../../containers/ShowPanelButtonContainer'

const FinalDecisionsTable = ({ decisionIds }) => (
  <Table
    header={
      <TableRow>
        <TableHeader title="Question" />
        <TableHeader title="Resolved" />
        <TableHeader title="Closed" />
        <TableHeader title="Market Predictions" />
        <TableHeader title="You Risked" />
        <TableHeader title="Returns" />
        <TableHeader title="Gain/Loss %" />
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
          <TopAlignedCell width="150">
            <DecisionPredictedPricesContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <DecisionAmountRiskedContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell width="150">
            <DecisionPotentialValuesContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell width="150">
            <DecisionPotentialGainLossContainer decisionId={decisionId} />
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

export default FinalDecisionsTable
