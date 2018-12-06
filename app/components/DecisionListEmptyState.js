import React from 'react'
import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer'

const DecisionListEmptyState = () => (
  <div>
    Nothing here yet...
    <br /> <br />

    <ShowPanelButtonContainer panelName="createDecisionMarket">
      New Decision
    </ShowPanelButtonContainer>
  </div>
)

export default DecisionListEmptyState
