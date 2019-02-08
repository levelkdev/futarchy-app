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
import DecisionQuestionContainer from '../../containers/DecisionQuestionContainer'
import DecisionPredictedPricesContainer from '../../containers/DecisionPredictedPricesContainer'
import DecisionAmountRiskedContainer from '../../containers/DecisionAmountRiskedContainer'
import DecisionPotentialValuesContainer from '../../containers/DecisionPotentialValuesContainer'
import DecisionPotentialGainLossContainer from '../../containers/DecisionPotentialGainLossContainer'
import ShowPanelButtonContainer from '../../containers/ShowPanelButtonContainer'

const OpenDecisionsTable = ({ decisionIds }) => (
  <Table
    header={
      <TableRow>
        <TableHeader title="Question" />
        <TableHeader title="Resolves" />
        <TableHeader title="Closes" />
        <TableHeader title="Market Predictions" />
        <TableHeader title="You Risked" />
        <TableHeader title="Potential Value" />
        <TableHeader title="Potential Gain/Loss %" />
        <TableHeader title="Actions" />
      </TableRow>
    }
  >
    <DecisionsTableRows columnCount={8}>
      {decisionIds.map(decisionId => (
        <TableRow key={decisionId}>
          <TopAlignedCell>
            <DecisionQuestionContainer decisionId={decisionId} />
          </TopAlignedCell>
          <TopAlignedCell>
            <Text>...</Text>
          </TopAlignedCell>
          <TopAlignedCell>
            <Text>...</Text>
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
              panelName="redeemWinnings"
              panelContext={{ decisionId }}
            >
              Redeem Winnings
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

export default OpenDecisionsTable
