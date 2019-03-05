import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Button, Countdown } from '@aragon/ui'
import MarketCirclesContainer from '../containers/MarketCirclesContainer'
import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer'

const DecisionCard = ({ decision }) => (
  <div>
    <Countdown end={Number(decision.decisionResolutionDate) * 1000} />
    <CardContainer>
      <CirclesContainer>
        <MarketCirclesContainer decisionId={decision.decisionId} />
      </CirclesContainer>
      <ContentContainer>
        <Question>
          {decision.question}
        </Question>
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
  </div>
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
