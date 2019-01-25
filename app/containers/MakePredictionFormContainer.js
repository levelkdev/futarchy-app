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
  )
})

const mapDispatchToProps = dispatch => ({
  executeBuy: async values => {
    dispatch(hidePanel())
    dispatch(buyMarketPositions({
      decisionId: values.decisionId,
      collateralAmount: values.collateralAmount,
      yesPurchaseAmounts: [
        values.yesShortAmount,
        values.yesLongAmount
      ],
      noPurchaseAmounts: [
        values.noShortAmount,
        values.noLongAmount
      ]
    }))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MakePredictionForm)
