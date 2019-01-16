import React from 'react'
import { connect } from 'react-redux'
import CountBadge from '../components/CountBadge'

const mapStateToProps = (state, ownProps) => ({
  count: 10
})
export default connect(
  mapStateToProps
)(CountBadge)
