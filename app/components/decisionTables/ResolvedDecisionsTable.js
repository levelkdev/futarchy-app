import React from 'react'
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Text
} from '@aragon/ui'
import TableEmptyRow from './TableEmptyRow'

const ResolvedDecisionsTable = ({ decisions }) => (
  <Table
    header={
      <TableRow>
        <TableHeader title="Question" />
        <TableHeader title="Resolved" />
        <TableHeader title="Closes" />
        <TableHeader title="Market Predictions" />
        <TableHeader title="You Risked" />
        <TableHeader title="Value" />
        <TableHeader title="Gain/Loss %" />
        <TableHeader title="Actions" />
      </TableRow>
    }
  >
    <TableEmptyRow columnCount={8} />
  </Table>
)

export default ResolvedDecisionsTable
