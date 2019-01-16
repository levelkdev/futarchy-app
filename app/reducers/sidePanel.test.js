import assert from 'assert'
import { hidePanel, showPanel } from '../actions'
import sidePanel from './sidePanel'

describe('sidePanel', () => {
  [
    {
      when: 'when given existing state and hidePanel action',
      should: 'should return empty object',
      state: {
        panelName: 'mock_panel_name',
        panelContext:'mock_panel_ctx'
      },
      action: hidePanel(),
      expected: {}
    },
    {
      when: 'when given undefined state and showPanel action',
      should: 'should return object with panelName and panelContext',
      state: undefined,
      action: showPanel({
        panelName: 'mock_panel_name',
        panelContext:'mock_panel_ctx'
      }),
      expected: {
        panelName: 'mock_panel_name',
        panelContext:'mock_panel_ctx'
      }
    },
    {
      when: 'when given panelName and panelContext with showPanel action',
      should: 'should return object with panelName and panelContext',
      state: {
        panelName: 'mock_old_panel_name',
        panelContext: 'mock_old_panel_ctx'
      },
      action: showPanel({
        panelName: 'mock_panel_name',
        panelContext: 'mock_panel_ctx'
      }),
      expected: {
        panelName: 'mock_panel_name',
        panelContext:'mock_panel_ctx'
      }
    }
  ].forEach(({ when, should, state, action, expected }) => {
    describe(when, () => {
      it(should, () => {
        assert.deepEqual(sidePanel(state, action), expected)
      })
    })
  })
})
