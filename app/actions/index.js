export const createDecision = ({ question }) => ({
  type: 'CREATE_DECISION',
  question
})

export const showPanel = ({ panelName }) => ({
  type: 'SHOW_PANEL',
  panelName
})

export const hidePanel = () => ({
  type: 'HIDE_PANEL'
})
