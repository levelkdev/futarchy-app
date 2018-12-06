import React from 'react'
import styled from 'styled-components'
import ShowPanelButtonContainer from '../Containers/ShowPanelButtonContainer'

const AppHeader = () => (
  <AppHeaderStyled>
    <AlignLeft>
      Futarchy
    </AlignLeft>
    <AlignRight>
      <ShowPanelButtonContainer panelName="createDecisionMarket">
        New Decision
      </ShowPanelButtonContainer>
    </AlignRight>
  </AppHeaderStyled>
)

const AppHeaderStyled = styled.div`
  display: flex;
  padding: 20px;
  background  white;
  border-bottom: 1px solid #e8e8e8;
`

const AlignLeft = styled.div`
  flex-grow: 1;
`

const AlignRight = styled.div`
  flex-grow: 0;
`

export default AppHeader
