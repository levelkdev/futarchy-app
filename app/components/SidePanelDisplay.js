import React from 'react'
import { SidePanel } from '@aragon/ui'
import CreateDecisionMarket from '../views/CreateDecisionMarket'
import MakePrediction from '../views/MakePrediction'
import RedeemRewards from '../views/RedeemRewards'

const titles = {
  createDecisionMarket: 'Create a New Decision',
  makePrediction: 'Make a Prediction'
}

const SidePanelDisplay = ({ panelName, closePanel }) => (
  <SidePanel
    title={titles[panelName] || ''}
    opened={typeof(panelName) !== 'undefined'}
    onClose={closePanel}
  >
    {(() => {
      switch (panelName) {
        case 'createDecisionMarket':
          return <CreateDecisionMarket />
        case 'makePrediction':
          return <MakePrediction />
        case 'redeemRewards':
          return <RedeemRewards />
        default:
          return null
      }
    })()}
  </SidePanel>
)

export default SidePanelDisplay
