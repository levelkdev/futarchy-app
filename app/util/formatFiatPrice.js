import formatPrice from './formatPrice'

// format with maximum 2 decimals
const formatFiatPrice = (symbol, price) => `${symbol}${formatPrice(price, 2)}`

export default formatFiatPrice
