import React from 'react'
import { connect } from 'react-redux'
import { showPanel } from '../actions'
import { Button } from '@aragon/ui'

const mapDispatchToProps = (dispatch, ownProps) => ({
  showPanel: () => dispatch(showPanel({ panelName: ownProps.panelName }))
})

const ShowPanelButton = ({ showPanel, children, buttonMode }) => (
  <Button
    onClick={showPanel}
    mode={buttonMode}
  >
    {children}
  </Button>
)

export default connect(
  null,
  mapDispatchToProps
)(ShowPanelButton)
