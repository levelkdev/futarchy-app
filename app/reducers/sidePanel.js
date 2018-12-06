const sidePanel = (state = null, action) => {
  switch (action.type) {
    case 'SHOW_PANEL':
      return action.panelName
    case 'HIDE_PANEL':
      return null
    default:
      return state
  }
}

export default sidePanel
