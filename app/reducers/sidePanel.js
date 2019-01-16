const sidePanel = (state = {}, action) => {
  switch (action.type) {
    case 'SHOW_PANEL':
      return {
        panelName: action.panelName,
        panelContext: action.panelContext
      }
      // return action.panelName
    case 'HIDE_PANEL':
      return {}
    default:
      return state
  }
}

export default sidePanel
