const actionPropMap = {
  'ACCOUNTS_LOADED': 'accounts',
  'TOKEN_BALANCE_LOADED': 'tokenBalance',
  'ACCOUNTS_LOADING_ERROR': 'accounts',
  'TOKEN_BALANCE_LOADING_ERROR': 'tokenBalance'
}

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
    case 'TOKEN_BALANCE_LOADED':
      return {
        ...state,
        [actionPropMap[action.type]]: {
          errorMessage: null,
          loaded: true
        }
      }
    case 'ACCOUNTS_LOADING_ERROR':
    case 'TOKEN_BALANCE_LOADING_ERROR':
      return {
        ...state,
        [actionPropMap[action.type]]: {
          loaded: false,
          errorMessage: action.errorMessage
        }
      }
    default:
      return state
  }
}

export default initDataLoadStates
