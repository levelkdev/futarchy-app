import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Button } from '@aragon/ui'
import MarketCircles from './MarketCircles'
import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer'

// TODO: deal with the `decision.pending = true` state
// TODO: show time remaining in the market using the <Countdown> aragon component 

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
      <div>
        STATUS: {decision.status}
        <br /><br />
      </div>
      <ButtonsContainer>
        <LinkStyled
          to={`/decision/${decision.decisionId}`}
          key={decision.decisionId}
        >
        <Button>View details</Button>
        </LinkStyled>
        <ShowPanelButtonContainer
          panelName="makePrediction"
          panelContext={{ decisionId: decision.decisionId }}
        >
          Predict
        </ShowPanelButtonContainer>
      </ButtonsContainer>
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
  
  margin-bottom: 20px;
`

const CirclesContainer = styled.div`
  padding: 5px;
  background: #F7FBFD;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 3px 3px 0 0;
  text-align: center;
`

const ContentContainer = styled.div`
  background: white;
  padding: 24px 32px;
  border-radius: 0 0 3px 3px;
`

const Question = styled.div`
  padding-bottom: 18px;
  min-height: 44px;
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

const LinkStyled = styled(Link)`
  text-decoration: none;
`

export default DecisionCard
