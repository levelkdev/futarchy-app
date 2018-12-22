const initDataLoadStates = (state = {
  accounts: {
    loaded: false,
    errorMessage: null
  },
  tokenBalance: {
    loaded: false,
    errorMessage: null
  }
}, action) => {
  switch (action.type) {
    case 'ACCOUNTS_LOADED':
      return {
        ...state,
        accounts: {
          errorMessage: null,
          loaded: true
        }
      }
    case 'ACCOUNTS_LOADING_ERROR':
      return {
        ...state,
        accounts: {
          loaded: false,
          errorMessage: action.errorMessage
        }
      }
    default:
      return state
  }
}

export default initDataLoadStates
