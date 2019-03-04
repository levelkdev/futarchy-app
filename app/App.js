import React from 'react'
import { AragonApp } from '@aragon/ui'
import styled from 'styled-components'
import { HashRouter as Router, Route } from 'react-router-dom'
import SidePanelDisplayContainer from './containers/SidePanelDisplayContainer'
import AppHeaderContainer from './containers/AppHeaderContainer'
import Home from './views/Home'
import DecisionDetail from './views/DecisionDetail'
import DecisionTrades from './views/DecisionTrades'
import Positions from './views/Positions'

const App = () => (
  <Router>
    <div>
      <AppHeaderContainer />
      
      <AppInner publicUrl="/aragon-ui/">
        <Route path="/" exact component={Home} />
        <Route path="/positions" exact component={Positions} />
        <Route path="/decision/:decisionId" component={DecisionDetail} />
        <Route path="/trades/:decisionId" component={DecisionTrades} />
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
