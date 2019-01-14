import React from 'react'
import { connect } from 'react-redux'
import { newDecision, hidePanel } from '../actions'

import CreateDecisionMarketForm from '../components/CreateDecisionMarketForm'

const ZERO_BYTES_32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
const LOWER_BOUND = 0
const UPPER_BOUND = 1000

const mapStateToProps = state => ({
  tokenBalance: state.tokenBalance,
  marketFundAmount: state.marketFundAmount
})

const mapDispatchToProps = dispatch => ({
  createDecision: async values => {
    dispatch(hidePanel())
    dispatch(newDecision({
      bytes32Script: ZERO_BYTES_32,
      question: values.question,
      lowerBound: LOWER_BOUND,
      upperBound: UPPER_BOUND
    }))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateDecisionMarketForm)
