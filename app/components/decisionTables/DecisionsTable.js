import React from 'react'
import OpenDecisionsTable from './OpenDecisionsTable'
import ResolvedDecisionsTable from './ResolvedDecisionsTable'
import ClosedDecisionsTable from './ClosedDecisionsTable'

const DecisionsTable = ({ decisionIds, statusFilter }) => {
  // Temporarily Using the OpenDecisionsTable component for all rendering
  // on the "positions" view.
  // TODO: Implement ResolvedDecisionsTable and ClosedDecisionsTable

  // const DecisionsTableComponent = {
  //   OPEN: OpenDecisionsTable,
  //   RESOLVED: ResolvedDecisionsTable,
  //   CLOSED: ClosedDecisionsTable
  // }[statusFilter]
  
  const DecisionsTableComponent = {
    OPEN: OpenDecisionsTable,
    RESOLVED: OpenDecisionsTable,
    CLOSED: OpenDecisionsTable
  }[statusFilter]

  return (
    <DecisionsTableComponent decisionIds={decisionIds} />
  )
}

export default DecisionsTable
