import React from 'react'
import { connect } from 'react-redux'
import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer.js'

const ShowActionButton = ({ decisionId }) => (

  <div>
    <ShowPanelButtonContainer
      panelName="redeemRewards"
      panelContext={{ decisionId }}
    >
      Redeem Rewards
    </ShowPanelButtonContainer >
  </div>
)

export default connect()(ShowActionButton)
