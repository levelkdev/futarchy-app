import React from 'react'
import OpenDecisionsTable from './OpenDecisionsTable'
import ResolvedDecisionsTable from './ResolvedDecisionsTable'
import ClosedDecisionsTable from './ClosedDecisionsTable'

const DecisionsTable = ({ decisionIds, statusFilter }) => {

  const DecisionsTableComponent = {
    OPEN: OpenDecisionsTable,
    RESOLVED: ResolvedDecisionsTable,
    CLOSED: ClosedDecisionsTable
  }[statusFilter]

  return (
    <DecisionsTableComponent decisionIds={decisionIds} />
  )
}

export default DecisionsTable
