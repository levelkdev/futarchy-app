import React from 'react'
import styled from 'styled-components'
import LeftArrow from '../icons/LeftArrow'
import { Link, NavLink } from 'react-router-dom'
import { Text, theme } from '@aragon/ui'
import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer'

const AppHeader = ({ decision, account }) => (
  <AppHeaderStyled>
    <AlignLeft>
      {decision ? <DecisionDetailsHeader /> : <TabsContainer account={account} />}
    </AlignLeft>
    <AlignRight>
      <NewDecisionButton>
        <ShowPanelButtonContainer panelName="createDecisionMarket">
          New Decision
        </ShowPanelButtonContainer>
      </NewDecisionButton>
    </AlignRight>
  </AppHeaderStyled>
)

const TabsContainer = ({ account }) => (
  <div>
    <Text size="xlarge">Decisions</Text>
    <br />
    <TabsContainterStyled>
      <NavLinkStyled exact to="/">Markets</NavLinkStyled>
      <NavLinkStyled exact to={`/positions/${account}`}>My Positions</NavLinkStyled>
    </TabsContainterStyled>
  </div>
)

const DecisionDetailsHeader = () => (
  <LinkStyled to="/">
    <BackButton>
      <LeftArrow />
    </BackButton>
    <HeaderText size="xlarge" >
      Decision Details
    </HeaderText>
  </LinkStyled>
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

const HeaderText = styled(Text)`
  position: relative;
  top: -2px;
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

const NewDecisionButton = styled.div`
  position: relative;
  top: -10px;
  right: 13px;
`

export default AppHeader
