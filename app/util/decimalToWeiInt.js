import DecimalJS from 'decimal.js'
let Decimal = DecimalJS.clone({ precision: 80, toExpPos: 9999 })

// TODO: this really should be tested
function decimalToWeiInt (val) {
  const d = new Decimal(val.toString())
  // * 10^18 to get the wei value
  return d.mul(new Decimal('1000000000000000000')).round().toString()
}

export default decimalToWeiInt
