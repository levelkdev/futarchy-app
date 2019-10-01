import React from 'react'
import { connect } from 'react-redux'
import { newDecision, hidePanel } from '../actions'

import CreateDecisionMarketForm from '../components/CreateDecisionMarketForm'

// TODO: LOWER_BOUND and UPPER_BOUND values will eventually be set via an oracle, and
//       will need to be removed from here

const ZERO_BYTES_32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
const LOWER_BOUND = 0
const UPPER_BOUND = 25 * 10 ** 18

const mapStateToProps = state => ({
  tokenBalance: state.tokenBalance,
  tokenSymbol: state.tokenSymbol,
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
