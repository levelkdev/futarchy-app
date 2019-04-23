const calcGainLossPercentage = (costBasis, returnValue) => {
  if (costBasis == 0)
    return 0
  return (returnValue - costBasis) / costBasis
}

export default calcGainLossPercentage
