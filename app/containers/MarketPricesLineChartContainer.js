import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import MarketPricesLineChart from '../components/MarketPricesLineChart'
import decisionById from '../reducers/computed/decisionById'
import tradePriceHistory from '../reducers/computed/tradePriceHistory'

const pricePointIncrement = 60 * 60 * 24 // 1 day

const mapStateToProps = (state, ownProps) => {
  const { trades, decisionMarkets: decisions } = state
  const { decisionId } = ownProps

  const decision = decisionById(state.decisionMarkets, decisionId)
  const lowerBound = decision && parseInt(decision.lowerBound)
  const upperBound = decision && parseInt(decision.upperBound)

  const hist = tradePriceHistory({
    decisionId,
    decisions,
    trades,
    increment: pricePointIncrement,
    now: state.latestBlock.timestamp
  })

  return {
    times: _.map(hist.yesHistory, point => point.start),
    yesPrices: _.map(hist.yesHistory, point => point.price),
    noPrices: _.map(hist.noHistory, point => point.price),
    yMin: lowerBound,
    yMax: upperBound
  }
}

export default connect(
  mapStateToProps
)(MarketPricesLineChart)
