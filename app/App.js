import React from 'react'
import { AragonApp } from '@aragon/ui'
import styled from 'styled-components'
import { HashRouter as Router, Route } from 'react-router-dom'
import SidePanelDisplayContainer from './containers/SidePanelDisplayContainer'
import AppHeader from './components/AppHeader'
import Home from './views/Home'
import DecisionDetail from './views/DecisionDetail'

const App = () => (
  <Router>
    <div>
      <AppHeader />
      <AppInner>
        <Route path="/" exact component={Home} />
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
