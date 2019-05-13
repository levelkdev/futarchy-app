import React from 'react'
import _ from 'lodash'
import { withRouter, matchPath } from 'react-router-dom'
import { connect } from 'react-redux'
import AppHeader from '../components/AppHeader'

const getDecisionRouteParams = pathname => {
  let path = matchPath(pathname, {
    path: `/decision/:decisionId`,
  })
  if (!path) {
    path = matchPath(pathname, {
      path: `/trades/:decisionId`
    })
  }
  return path ? path.params : {}
}

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  {  decisionId }
)

const mapStateToProps = (state, ownProps) => ({
  decision: findDecisionById(
    state.decisionMarkets,
    getDecisionRouteParams(ownProps.location.pathname).decisionId
  ),
  account: state.accounts[0]
})

export default withRouter(connect(
  mapStateToProps
)(AppHeader))
