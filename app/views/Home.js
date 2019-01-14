import React from 'react'
import { Link } from 'react-router-dom'
import DecisionListContainer from '../containers/DecisionListContainer'

const Home = () => (
  <div>
    <Link to='/account'>View performance data...</Link>
    <DecisionListContainer />
  </div>
)

export default Home
