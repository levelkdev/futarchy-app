import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { Button, Countdown, IconTime } from '@aragon/ui'
import { date, time } from '../util/formatDateTime'
import decisionStatuses from'../constants/decisionStatuses'
import MarketCirclesContainer from '../containers/MarketCirclesContainer'
import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer'

const DecisionCard = ({ decision }) => (
  <div>
    <DateDisplayStyled>
      <DateDisplay decision={decision} />
    </DateDisplayStyled>
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

const DateDisplay = ({ decision }) => {
  switch (decision.status) {
    case decisionStatuses.OPEN:
      return <Countdown end={new Date(Number(decision.decisionResolutionDate) * 1000)} />
    case decisionStatuses.RESOLVED:
      return <Countdown end={new Date(Number(decision.priceResolutionDate) * 1000)} />
    case decisionStatuses.CLOSED:
      return <DateTime timestamp={decision.priceResolutionDate} />
  }
}

const DateTime = ({ timestamp }) => (
  <React.Fragment>
    <IconTimeStyled />
    <StyledDate>{date(timestamp)}</StyledDate>
    <StyledTime>{time(timestamp)}</StyledTime>
  </React.Fragment>
)

const IconTimeStyled = styled(IconTime)`
  margin-right: 12px;
`

const StyledDate = styled.span`
  font-weight: bold;
`

const StyledTime = styled.span`
  margin-left: 10px;
  font-size: 12px;
  color: #707070;
`

const DateDisplayStyled = styled.div`
  margin-bottom: 5px;
`

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
