import React from 'react'
import { SidePanel } from '@aragon/ui'
import CreateDecisionMarket from '../views/CreateDecisionMarket'
import PredictDecisionMarket from '../views/PredictDecisionMarket'

const titles = {
  createDecisionMarket: 'Create a New Decision'
}

const SidePanelDisplay = ({ panelName, closePanel }) => (
  <SidePanel
    title={titles[panelName] || ''}
    opened={panelName !== null}
    onClose={closePanel}
  >
    {(() => {
      switch (panelName) {
        case 'createDecisionMarket':
          return <CreateDecisionMarket />
        case 'predictDecisionMarket':
          return <PredictDecisionMarket />
        default:
          return null
      }
    })()}
  </SidePanel>
)

export default SidePanelDisplay
