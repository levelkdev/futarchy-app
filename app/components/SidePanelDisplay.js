import React from 'react'
import { SidePanel } from '@aragon/ui'
import CreateDecisionMarket from '../views/CreateDecisionMarket'
import MakePrediction from '../views/MakePrediction'

const titles = {
  createDecisionMarket: 'Create a New Decision',
  makePrediction: 'Make a Prediction'
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
        case 'makePrediction':
          return <MakePrediction />
        default:
          return null
      }
    })()}
  </SidePanel>
)

export default SidePanelDisplay
