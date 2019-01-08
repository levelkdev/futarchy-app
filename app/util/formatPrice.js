export default price => {
  let roundedPrice
  if (price >= 10000) {
    roundedPrice = roundTo(price)
  } else if (price >= 1) {
    roundedPrice = roundTo(price, 2)
  } else if (price >= 0.01) {
    roundedPrice = roundTo(price, 3)
  } else if (price < 0.01) {
    roundedPrice = roundTo(price, magnitude(price) + 2)
  }
  return roundedPrice + ''
}

function roundTo(n, digits) {
  if (digits === undefined) {
    digits = 0
  }

  var multiplicator = Math.pow(10, digits)
  n = parseFloat((n * multiplicator).toFixed(11))
  var test =(Math.round(n) / multiplicator)
  return +(test.toFixed(digits))
}

function magnitude (n) {
  return -Math.floor( Math.log(n) / Math.log(10) + 1)
}
