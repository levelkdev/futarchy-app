import { theme } from '@aragon/ui'

const negativePositiveColor = n => {
  return n >= 0 ? theme.positive : theme.negative
}

export default negativePositiveColor
