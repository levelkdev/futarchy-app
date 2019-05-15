import sumPerformanceCalc from './sumPerformanceCalc'

const realizedGainLoss = (trader, performance, decisions) => {
  let winningMarkets = decisions.reduce(
    (obj, decision) => {
      obj[decision.decisionId] = decision.passed ? 'yes' : 'no';
      return obj
    },
    {}
  )
  return sumPerformanceCalc('RealizedGainLoss', trader, performance, winningMarkets)
}

export default realizedGainLoss
