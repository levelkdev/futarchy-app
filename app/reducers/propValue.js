const propValue = ({ prop, defaultValue }) => (state = defaultValue, action) => {
  if (action.type == 'PROP_VALUE_LOADED' && action.prop == prop) {
    return action.value
  } else {
    return state
  }
}

export default propValue
