const mockDecision = ({
  decisionId,
  pending = false,
  status = null,
  decisionResolutionDate = '100',
  priceResolutionDate = '200',
  startDate = '1000',
  yesMarketPrice,
  noMarketPrice,
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
    yesMarketPrice,
    noMarketPrice,
    resolved,
    passed
  }
}

export default mockDecision
