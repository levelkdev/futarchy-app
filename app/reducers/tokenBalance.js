const tokenBalance = (state = null, action) => {
  switch (action.type) {
    case 'TOKEN_BALANCE_LOADED':
      return action.balance
    default:
      return state
  }
}

export default tokenBalance
