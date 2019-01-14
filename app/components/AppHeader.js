import React from 'react'
import styled from 'styled-components'
import LeftArrow from '../icons/LeftArrow'
import { Link, NavLink } from 'react-router-dom'
import { Text } from '@aragon/ui'
import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer'

const AppHeader = ({ decision }) => (
  <AppHeaderStyled>
    <AlignLeft>
      {
        decision ?
          <DecisionHeader question={decision.question} /> : 
          <TabsContainer />
      }
    
    </AlignLeft>
    <AlignRight>
      <ShowPanelButtonContainer panelName="createDecisionMarket">
        New Decision
      </ShowPanelButtonContainer>
    </AlignRight>
  </AppHeaderStyled>
)

const TabsContainer = () => (
  <div>
    <Text size="xlarge">Futarchy</Text>
    <br />
    <TabsContainterStyled>
      <NavLinkStyled exact to="/">Open Questions</NavLinkStyled>
      <NavLinkStyled exact to="/closed-questions">Closed Questions</NavLinkStyled>
      <NavLinkStyled exact to="/account">My Account</NavLinkStyled>
    </TabsContainterStyled>
  </div>
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
  padding: 20px 20px 0;
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
  font-size: 16px;
`

const activeClassName = 'active';

const NavLinkStyled = styled(NavLink).attrs({
  activeClassName: activeClassName,
  })`
  color: #333;
  padding-bottom: 5px;
  margin: 30px 30px -1px 0px;
  border-bottom: 4px solid 'transparent';
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;
  &.${activeClassName} {
    color: theme.accent;
    border-bottom: 4px solid #1DD9D5;
    font-weight: bold;
  }
`

const TabsContainterStyled = styled.div`
  display: flex;
  flex-direction: row;
`

export default AppHeader
