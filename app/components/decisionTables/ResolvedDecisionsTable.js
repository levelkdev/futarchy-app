import React from 'react'
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Text
} from '@aragon/ui'

const OpenDecisionsTable = () => (
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
    <TableRow>
      <TableCell>
        <Text>...</Text>
      </TableCell>
      <TableCell>
        <Text>...</Text>
      </TableCell>
      <TableCell>
        <Text>...</Text>
      </TableCell>
      <TableCell>
        <Text>...</Text>
      </TableCell>
      <TableCell>
        <Text>...</Text>
      </TableCell>
      <TableCell>
        <Text>...</Text>
      </TableCell>
      <TableCell>
        <Text>...</Text>
      </TableCell>
      <TableCell>
        <Text>...</Text>
      </TableCell>
    </TableRow>
  </Table>
)

export default OpenDecisionsTable
