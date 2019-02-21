import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { hidePanel, buyMarketPositions } from '../actions'

import MakePredictionForm from '../components/MakePredictionForm'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { decisionId }
)

const mapStateToProps = state => ({
  decision: findDecisionById(
    state.decisionMarkets,
    state.sidePanel.panelContext.decisionId
  ),
  tokenBalance: state.tokenBalance
})

const mapDispatchToProps = dispatch => ({
  executeBuy: async values => {
    const {
      decisionId,
      collateralAmount,
      yesPredictionChoiceIndex,
      noPredictionChoiceIndex
    } = values
    
    dispatch(buyMarketPositions({
      decisionId,
      collateralAmount,
      yesOutcomeTokenIndex: predictionChoiceToOutcomeIndex(yesPredictionChoiceIndex),
      noOutcomeTokenIndex: predictionChoiceToOutcomeIndex(noPredictionChoiceIndex)
    }))

    dispatch(hidePanel())
  }
})

function predictionChoiceToOutcomeIndex (choice) {
  if (choice === 1) {
    return 0
  } else if (choice === 2) {
    return 1
  } else {
    return null
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MakePredictionForm)
