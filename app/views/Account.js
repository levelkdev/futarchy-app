import React from 'react'
import styled from 'styled-components'
import PerformanceTotalsContainer from '../containers/PerformanceTotalsContainer'

const Account = () => (
  <ViewElem>
    Account Balances:
    <PerformanceTotalsContainer />
  </ViewElem>
)

const ViewElem = styled.div`
  width: 100%;
`

export default Account
