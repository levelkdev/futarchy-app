import React from 'react'
import { connect } from 'react-redux'

import PerformanceSummary from '../components/PerformanceSummary'

const mapStateToProps = state => ({
  performance: state.performance
})
export default connect(
  mapStateToProps
)(PerformanceSummary)
