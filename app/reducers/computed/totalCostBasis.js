import sumPerformanceCalc from './sumPerformanceCalc'

const totalCostBasis = (trader, performance) => {
  return sumPerformanceCalc('yesCostBasis', trader, performance)
}

export default totalCostBasis
