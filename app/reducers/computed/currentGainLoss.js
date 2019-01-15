import sumPerformanceCalc from './sumPerformanceCalc'

const currentGainLoss = (trader, performance) => {
  return sumPerformanceCalc('totalGainLoss', trader, performance)
}

export default currentGainLoss
