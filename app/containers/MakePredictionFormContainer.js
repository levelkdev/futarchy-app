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
    dispatch(hidePanel())
    console.log(values)
    // User choice for long or short on yes market (either "less" or "more")
    values.yesMarket
    // User choice for long or short on no market (either "less" or "more")
    values.noMarket
    
    // get the following for calcOutcomeTokenCount
    // getting outcome tokens sold from futarchy.sol; getting funding and feeFactor from redux store
    /* below from old calcOutcomeTokenCount.js
    // netOutcomeTokensSold = [
    //     await market.netOutcomeTokensSold(0),
    //     await market.netOutcomeTokensSold(1)
    // ]
    
    // funding = await market.funding()
    // feeFactor = await market.fee()
    // END CODE FROM calcOutcomeTokenCount.js
    */
    
    // dispatch netOutcomeTokensSold for yes market (updates state)
    dispatch(fetchNetOutcomeTokensSoldForDecision({
      decisionId: values.decisionId,
      marketIndex: 0      
    }))
    
    // dispatch netOutcomeTokensSold for no market (updates state)
    dispatch(fetchNetOutcomeTokensSoldForDecision({
      decisionId: values.decisionId,
      marketIndex: 1
    }))
    
    // get net long and net short outcome tokens sold for yes and no markets, funding, and feeFactor from state
    // Do this all in a single action
    
    dispatch(buyMarketPositions({
      decisionId: values.decisionId,
      collateralAmount: values.collateralAmount,
      yesPurchaseAmounts: [
        // TODO replace with output of calcOutcomeTokenCount
        // values.yesShortAmount,
        // values.yesLongAmount
      ],
      noPurchaseAmounts: [
        // TODO replace with output of calcOutcomeTokenCount
        // values.noShortAmount,
        // values.noLongAmount
      ]
    }))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MakePredictionForm)
