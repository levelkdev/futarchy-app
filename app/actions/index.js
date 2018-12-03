export const sendCreateDecisionMarket = ({ question }) => ({
  type: 'SEND_CREATE_DECISION_MARKET',
  question
})

export const updateAppEvents = (events) => ({
  type: 'UPDATE_APP_EVENTS',
  events
})
