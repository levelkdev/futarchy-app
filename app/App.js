import React from 'react'
import { AragonApp } from '@aragon/ui'
import styled from 'styled-components'
import { HashRouter as Router, Route } from 'react-router-dom'
import SidePanelDisplayContainer from './containers/SidePanelDisplayContainer'
import AppHeaderContainer from './containers/AppHeaderContainer'
import Home from './views/Home'
import DecisionDetail from './views/DecisionDetail'
import Account from './views/Account'
import ClosedDecisions from './views/ClosedDecisions'

const App = () => (
  <Router>
    <div>
      <AppHeaderContainer />
      
      <AppInner publicUrl="/aragon-ui/">
        <Route path="/" exact component={Home} />
        <Route path="/closed-questions" exact component={ClosedDecisions} />
        <Route path="/account" exact component={Account} />
        <Route path="/decision/:decisionId" component={DecisionDetail} />
        <SidePanelDisplayContainer />
      </AppInner>
    </div>
  </Router>
)

const AppInner = styled(AragonApp)`
  display: flex;
  padding 20px;
`

export default App
