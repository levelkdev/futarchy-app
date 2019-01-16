import React from 'react'
import TableEmptyRow from './TableEmptyRow'

const DecisionsTableRows = ({ columnCount, children }) => {
  if (columnCount == 0) {
    return <TableEmptyRow columnCount={8} />
  } else {
    return children
  }
}

export default DecisionsTableRows
