import React from 'react'
import {
  TableRow,
  TableCell,
  Text
} from '@aragon/ui'

const TableEmptyRow = ({ columnCount }) => (
  <TableRow>
    {(() => {
      let cells = []
      for (let i = 0; i < columnCount; i++) {
        cells.push(
          <TableCell key={i}>
            <Text>...</Text>
          </TableCell>
        )
      }
      return cells
    })()}
  </TableRow>
)

export default TableEmptyRow
