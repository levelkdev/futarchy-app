import React from 'react'
import styled from 'styled-components'
import MarketCircles from './MarketCircles'

// TODO: deal with the `decision.pending = true` state

const DecisionCard = ({ decision }) => (
  <CardContainer>
    <CirclesContainer>
      <MarketCircles
        yesDisplayPrice={decision.yesMarketPredictedPrice}
        noDisplayPrice={decision.noMarketPredictedPrice}
        yesPercentage={decision.yesMarketPrice}
        noPercentage={decision.noMarketPrice} />
    </CirclesContainer>
    <ContentContainer>
      <Question>
        {decision.question}
      </Question>
    </ContentContainer>
  </CardContainer>
)

const CardContainer = styled.div`
  /* TODO: apply to global: */
  color: #464646;
  font-weight: 100;

  border: 1px solid #dadada;
  box-shadow: 0px 0px 6px #00000012;
  border-radius: 3px;
`

const CirclesContainer = styled.div`
  padding: 20px;
  background: #F7FBFD;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 3px 3px 0 0;
  text-align: center;
`

const ContentContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 0 0 3px 3px;
`

const Question = styled.div`
  padding-bottom: 20px;
`

export default DecisionCard
