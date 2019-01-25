import React from 'react'
import { NavLink } from 'react-router-dom'
import { theme } from '@aragon/ui'
import styled from 'styled-components'
import DecisionQuestionContainer from '../containers/DecisionQuestionContainer'
import MarketPricesLineChartContainer from '../containers/MarketPricesLineChartContainer'

const DecisionDetail = ({ match }) => (
  <DecisionDetailOuter>

    <DecisionDetailInner>
      <DecisionLeftContent>
        <DecisionQuestionContainer decisionId={match.params.decisionId} />
      </DecisionLeftContent>
      <DecisionRightContent>
        <ChartOuter>
          <MarketPricesLineChartContainer decisionId={match.params.decisionId} />
        </ChartOuter>
      </DecisionRightContent>
    </DecisionDetailInner>

    <br /><br />

    <NavLink exact to={`/trades/${match.params.decisionId}`}>View trade history</NavLink>

  </DecisionDetailOuter>
)

export default DecisionDetail

const DecisionDetailOuter = styled.div`
  padding: 0 13px;
  width: 100%;
`

const DecisionDetailInner = styled.div`
  display: flex;
`

const DecisionLeftContent = styled.div`
  background: ${theme.contentBackground};
  border: 1px solid ${theme.contentBorder};
  border-radius: 3px;
  flex-grow: 1;
  padding: 15px;
`

const DecisionRightContent = styled.div`
  margin-left: 20px;
`

const ChartOuter = styled.div`
  width: 360px;
`
