import React from 'react'
import {
  AragonApp,
  Text,
  observe
} from '@aragon/ui'
import Aragon, { providers } from '@aragon/client'
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


// WITH OBSERVED COUNT
// export default class App extends React.Component {
//   render () {
//     return (
//       <AppContainer>
//         <div>
//           <ActiveDecisionMarketList />
//           <ObservedCount observable={this.props.observable} />
//           <CreateDecisionMarket app={this.props.app} />
//         </div>
//       </AppContainer>
//     )
//   }
// }

const LargeText = (state) => {
  const { count } = state
  console.log('GOT STATE: ', state)
  return (
    <Text.Block style={{ textAlign: 'center' }} size='xxlarge'>{count}</Text.Block>
  )
}

const ObservedCount = observe(
  state$ => state$,
  { count: 0 }
)(LargeText)
