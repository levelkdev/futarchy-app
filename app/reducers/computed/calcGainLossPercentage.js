const calcGainLossPercentage = (costBasis, returnValue) => {
  return (returnValue - costBasis) / costBasis
}

export default calcGainLossPercentage
