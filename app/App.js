import React from 'react'
import {
  AragonApp,
  Text,
  observe
} from '@aragon/ui'
import styled from 'styled-components'
import ActiveDecisionMarketList from './containers/ActiveDecisionMarketList'
import SidePanelDisplayContainer from './containers/SidePanelDisplayContainer'
import EmptyState from './views/EmptyState'

const AppContainer = styled(AragonApp)`
  display: flex;
  align-items: center;
  justify-content: center;
`

export default class App extends React.Component {
  render () {
    return (
      <AppContainer>
        <div>
          <ActiveDecisionMarketList />
          <br /> <br />
          
          <EmptyState />
          <SidePanelDisplayContainer />
        </div>
      </AppContainer>
    )
  }
}
