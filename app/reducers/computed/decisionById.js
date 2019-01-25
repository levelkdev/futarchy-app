import _ from 'lodash'

const decisionById = (decisions, decisionId) => {
  return _.find(decisions, { decisionId })
}

export default decisionById
