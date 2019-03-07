import moment from 'moment'

export const shortDate = timestamp => moment(Number(timestamp) * 1000).format('YYYY.DD.MM')
export const date = timestamp => moment(Number(timestamp) * 1000).format('LL')
export const time = timestamp => moment(Number(timestamp) * 1000).format('LT')
