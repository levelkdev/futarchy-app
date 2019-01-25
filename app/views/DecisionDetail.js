import React from 'react'
import styled from 'styled-components'
import DecisionSummaryContainer from '../containers/DecisionSummaryContainer'
import DecisionTradeListContainer from '../containers/DecisionTradeListContainer'
import MarketPricesLineChartContainer from '../containers/MarketPricesLineChartContainer'

const DecisionDetail = ({ match }) => (
  <div>
    <ChartOuter>
      <MarketPricesLineChartContainer decisionId={match.params.decisionId} />
    </ChartOuter>
    <DecisionSummaryContainer decisionId={match.params.decisionId} />
    <DecisionTradeListContainer decisionId={match.params.decisionId} />
  </div>
)

export default DecisionDetail

const ChartOuter = styled.div`
  width: 360px;
`
