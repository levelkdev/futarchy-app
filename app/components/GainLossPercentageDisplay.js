import React from 'react'
import { theme } from '@aragon/ui'
import styled from 'styled-components'

const GainLossPercentageDisplay = ({ percentage }) => (
  <GainLossPercentageDisplayStyled percentage={percentage}>
    <GainLossArrow value={percentage} />
    {formatPercentage(percentage)}
  </GainLossPercentageDisplayStyled>
)

const GainLossArrow = ({ value }) => value >= 0 ? <UpArrow /> : <DownArrow />

const GainLossPercentageDisplayStyled = styled.span`
  color: ${props => props.percentage >= 0 ? theme.positive : theme.negative }
`

const UpArrow = styled.span`
  position: relative;
  bottom: 10px;
  margin-right: 4px;
  width: 0px;
  height: 0px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid ${theme.positive};
`

const DownArrow = styled.span`
  position: relative;
  top: 10px;
  margin-right: 4px;
  width: 0px;
  height: 0px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid ${theme.negative};
`

const formatPercentage = p => Math.abs(twoDecimalPercentage(p)) + '%'

const twoDecimalPercentage = p => Math.round(p * 10000) / 100

export default GainLossPercentageDisplay
