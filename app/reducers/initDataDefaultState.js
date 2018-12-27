import initDataProps from './initDataProps'

let initDataDefaultState = {}

initDataProps.forEach(val => {
  initDataDefaultState[val.prop] = {
    loaded: false,
    errorMessage: null
  }
})

export default initDataDefaultState
