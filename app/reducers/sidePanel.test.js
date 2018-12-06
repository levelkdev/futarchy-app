import assert from 'assert'
import { hidePanel, showPanel } from '../actions'
import sidePanel from './sidePanel'

describe('sidePanel', () => {
  [
    {
      when: 'when given null state and hidePanel action',
      should: 'should return null state',
      state: null,
      action: hidePanel(),
      expected: null
    },
    {
      when: 'when given null state and showPanel action',
      should: 'should return panelName',
      state: null,
      action: showPanel({ panelName: 'mock_panel_name' }),
      expected: 'mock_panel_name'
    },
    {
      when: 'when given panelName as state and showPanel action',
      should: 'should return the new panelName',
      state: 'mock_old_panel_name',
      action: showPanel({ panelName: 'mock_panel_name' }),
      expected: 'mock_panel_name'
    }
  ].forEach(({ when, should, state, action, expected }) => {
    describe(when, () => {
      it(should, () => {
        assert.equal(sidePanel(state, action), expected)
      })
    })
  })
})
