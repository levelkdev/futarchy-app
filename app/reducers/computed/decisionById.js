import _ from 'lodash'

const decisionById = (decisions, decisionId) => {
  return _.find(decisions, { id: decisionId })
}

export default decisionById
