import React from 'react'
import { connect } from 'react-redux'
import { showPanel } from '../actions'
import { Button } from '@aragon/ui'

const mapDispatchToProps = (dispatch, ownProps) => ({
  showPanel: () => dispatch(showPanel({ panelName: ownProps.panelName, panelContext: ownProps.panelContext}))
})

const ShowPanelButton = ({ showPanel, children }) => (
  <Button
    onClick={showPanel}
    mode="strong"
  >
    {children}
  </Button>
)

export default connect(
  null,
  mapDispatchToProps
)(ShowPanelButton)
