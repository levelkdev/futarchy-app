import initDataDefaultState from './initDataDefaultState'

const initDataLoadStates = (state = initDataDefaultState, action) => {
  switch (action.type) {
    case 'PROP_VALUE_LOADED':
      return {
        ...state,
        [action.prop]: {
          errorMessage: null,
          loaded: true
        }
      }
    case 'PROP_VALUE_LOADING_ERROR':
      return {
        ...state,
        [action.prop]: {
          loaded: false,
          errorMessage: action.errorMessage
        }
      }
    default:
      return state
  }
}

export default initDataLoadStates
