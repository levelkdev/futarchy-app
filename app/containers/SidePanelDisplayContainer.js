import React from 'react'
import { connect } from 'react-redux'
import SidePanelDisplay from '../components/SidePanelDisplay'
import { hidePanel } from '../actions';

const mapStateToProps = state => ({
  panelName: state.sidePanel.panelName
})

const mapDispatchToProps = dispatch => ({
  closePanel: () => dispatch(hidePanel())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SidePanelDisplay)
