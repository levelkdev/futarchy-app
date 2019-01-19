import React from 'react'
import styled from 'styled-components'
import DecisionSummaryContainer from '../containers/DecisionSummaryContainer'
import DecisionTradeListContainer from '../containers/DecisionTradeListContainer'
import MarketPricesLineChart from '../components/MarketPricesLineChart'

const DecisionDetail = ({ match }) => (
  <div>
    <ChartOuter>
      <MarketPricesLineChart />
    </ChartOuter>
    <DecisionSummaryContainer decisionId={match.params.decisionId} />
    <DecisionTradeListContainer decisionId={match.params.decisionId} />
  </div>
)

export default DecisionDetail

const ChartOuter = styled.div`
  width: 360px;
`
