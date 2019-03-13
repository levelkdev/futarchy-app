import moment from 'moment'

export const shortMonthDay = formatFn('MMM D')
export const shortDate = formatFn('YYYY.DD.MM')
export const date = formatFn('LL')
export const time = formatFn('LT')

function formatFn(formatString) {
  return blocktime => blocktimeToMoment(blocktime).format(formatString)
}

function blocktimeToMoment (blocktime) {
  return moment(Number(blocktime) * 1000)
}
