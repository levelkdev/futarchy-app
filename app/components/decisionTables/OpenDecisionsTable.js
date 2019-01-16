import React from 'react'
import _ from 'lodash'
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
          <TableCell>
            <DecisionQuestionContainer decisionId={decisionId} />
          </TableCell>
          <TableCell>
            <Text>...</Text>
          </TableCell>
          <TableCell>
            <Text>...</Text>
          </TableCell>
          <TableCell width="150">
            <DecisionPredictedPricesContainer decisionId={decisionId} />
          </TableCell>
          <TableCell>
            <Text>TODO</Text>
          </TableCell>
          <TableCell>
            <Text>TODO</Text>
          </TableCell>
          <TableCell>
            <Text>TODO</Text>
          </TableCell>
          <TableCell>
            <Text>TODO</Text>
          </TableCell>
        </TableRow>
      ))}
    </DecisionsTableRows>
  </Table>
)

export default OpenDecisionsTable
