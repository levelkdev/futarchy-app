import React from 'react'
import styled from 'styled-components'
import { shortDate, time } from '../../util/formatDateTime'

const TimeframeCell = ({ time }) => (
  <div>
    <StyledTimeframe>
      <DateTime timestamp={time} />
    </StyledTimeframe>
  </div>
)

const DateTime = ({ timestamp }) => (
  <React.Fragment>
    <StyledDate>{shortDate(timestamp)}</StyledDate>
    <StyledTime>{time(timestamp)}</StyledTime>
  </React.Fragment>
)

const StyledDate = styled.div`
  font-weight: bold;
`

const StyledTime = styled.div`

`

const StyledTimeframe = styled.div`
  font-size: 12px;
  padding-top: 3px;
`

export default TimeframeCell
