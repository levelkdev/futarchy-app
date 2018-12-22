const accounts = (state = [], action) => {
  switch (action.type) {
    case 'ACCOUNTS_LOADED':
      return action.accounts
    default:
      return state
  }
}

export default accounts
