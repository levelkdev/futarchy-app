import React from 'react'
import styled from 'styled-components'
import LeftArrow from '../icons/LeftArrow'
import { Link } from 'react-router-dom'
import ShowPanelButtonContainer from '../Containers/ShowPanelButtonContainer'

const AppHeader = ({ decision }) => (
  <AppHeaderStyled>
    <AlignLeft>
      {
        decision ?
          <DecisionHeader question={decision.question} /> :
          <span>Futarchy</span>
      }
    </AlignLeft>
    <AlignRight>
      <ShowPanelButtonContainer panelName="createDecisionMarket">
        New Decision
      </ShowPanelButtonContainer>
    </AlignRight>
  </AppHeaderStyled>
)

const DecisionHeader = ({ question }) => (
  <div>
    <LinkStyled to="/">
      <BackButton>
        <LeftArrow />
      </BackButton>
    </LinkStyled>
    {question}
  </div>
)

const AppHeaderStyled = styled.div`
  display: flex;
  padding: 20px;
  background  white;
  border-bottom: 1px solid #e8e8e8;
`

const AlignLeft = styled.div`
  flex-grow: 1;
`

const AlignRight = styled.div`
  flex-grow: 0;
`

const BackButton = styled.span`
  padding: 17px 10px 10px 10px;
  cursor: pointer;
`

const LinkStyled = styled(Link)`
  text-decoration: none;
`

export default AppHeader
