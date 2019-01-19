import React from 'react'
import styled from 'styled-components'
import DecisionMarketName from '../DecisionMarketName'

const MarketNameStyled = ({ type }) => (
  <MarketNameOuter>
    <DecisionMarketName type={type} />
  </MarketNameOuter>
)

const MarketNameOuter = styled.div`
  display: inline-block;
  width: 25px;
  text-align: right;
  font-weight: bold;
`

export default MarketNameStyled
