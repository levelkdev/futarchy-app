const mockDecision = ({
  decisionId,
  pending = false,
  status = null,
  decisionResolutionDate = '100',
  priceResolutionDate = '200',
  startDate = '1000',
  yesMarketAveragePricePercentage,
  noMarketAveragePricePercentage,
  resolved,
  passed
}) => {
  return {
    decisionId: `mock_decision_id_${decisionId}`,
    question: `mock_question_${decisionId}`,
    pending,
    status,
    decisionResolutionDate,
    priceResolutionDate,
    startDate,
    yesMarketAveragePricePercentage,
    noMarketAveragePricePercentage,
    resolved,
    passed
  }
}

export default mockDecision
