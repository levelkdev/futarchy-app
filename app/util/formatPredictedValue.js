/**
 * Formatting function for the display of the predicted value. This value
 * is determined by where the trading price falls between the upper and
 * lower bounds of the LMSR automated market maker.
 * 
 * TODO: we're assuming this value is a USD ($) amount right now, but since
 *       it could be anything, this should probably be modified to be
 *       configurable for each application instance.
 */
import formatFiatPrice from '../util/formatFiatPrice'

const formatPredictedValue = val => {
  return `${formatFiatPrice('$', parseInt(val) / 10 ** 18)}`
}

export default formatPredictedValue
