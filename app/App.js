import React from 'react'
import {
  AragonApp,
  Text,
  observe
} from '@aragon/ui'
import styled from 'styled-components'
import ActiveDecisionMarketList from './containers/ActiveDecisionMarketList'
import CreateDecisionMarket from './containers/CreateDecisionMarket'

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
          <CreateDecisionMarket app={this.props.app} />
        </div>
      </AppContainer>
    )
  }
}
