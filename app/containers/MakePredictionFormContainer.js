import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { hidePanel, buyMarketPositions } from '../actions'
import outcomeTokenIndexes from '../constants/outcomeTokenIndexes'

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

const choices = {
  MORE: 'MORE',
  LESS: 'LESS'
}

const choiceByIndex = {
  0: choices.MORE,
  1: choices.LESS
}

function predictionChoiceToOutcomeIndex (choiceIndex) {
  const choice = choiceByIndex[choiceIndex]
  if (choice === choices.LESS) {
    return outcomeTokenIndexes.SHORT
  } else if (choice === choices.MORE) {
    return outcomeTokenIndexes.LONG
  } else {
    return null
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MakePredictionForm)
