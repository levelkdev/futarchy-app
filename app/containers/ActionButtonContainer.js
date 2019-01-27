import React from 'react'
import { connect } from 'react-redux'
import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer.js'

const ShowActionButton = ({ decisionId }) => (

  <div>
    <ShowPanelButtonContainer
      panelName="redeemWinnings"
      panelContext={{ decisionId }}
    >
      Redeem Winnings
    </ShowPanelButtonContainer >
  </div>
)

export default connect()(ShowActionButton)
