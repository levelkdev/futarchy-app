import React from 'react'
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Text
} from '@aragon/ui'
import TableEmptyRow from './TableEmptyRow'

const ClosedDecisionsTable = ({ decisions }) => (
  <Table
    header={
      <TableRow>
        <TableHeader title="Question" />
        <TableHeader title="Closed" />
        <TableHeader title="Market Predictions" />
        <TableHeader title="You Risked" />
        <TableHeader title="Final Value" />
        <TableHeader title="Final Gain/Loss %" />
        <TableHeader title="Actions" />
      </TableRow>
    }
  >
    <TableEmptyRow columnCount={7} />
  </Table>
)

export default ClosedDecisionsTable
