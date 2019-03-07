export const logLevel = {
  DEBUG: 'DEBUG',
  ERROR: 'ERROR'
}

export const log = (level, message, object) => {
  const silent = !(
    (level == logLevel.DEBUG && process.env.DEBUG == 'true') ||
    (level == logLevel.ERROR)
  )
  const logFn = level == logLevel.ERROR ? 'error' : 'log'
  !silent && console[logFn](message, object)
}

export const logDebug = (message, object) => log(logLevel.DEBUG, message, object)
export const logError = (message, err) => log(logLevel.ERROR, message, err)
