import assert from 'assert'
import { differenceWithEvents, pascalToUpperSnake } from './aragonRedux'

const mockEvent1 = { event: 'MOCK_EVENT', transactionHash: 'a1b2c3' }
const mockEvent2 = { event: 'MOCK_EVENT', transactionHash: 'd4e5f6' }

const mockEventState1 = [ mockEvent1 ]
const mockEventState2 = [ mockEvent1, mockEvent2 ]

describe('aragonRedux', () => {
  describe('differenceWithEvents()', () => {
    describe('when given different initial and final event states', () => {
      it('should return an array of the new events', () => {
        assert.deepEqual(
          differenceWithEvents(mockEventState1, mockEventState2),
          [ mockEvent2 ]
        )
      })
    })

    describe('when given the same initial and final event states', () => {
      it('should return an empty array', () => {
        assert.deepEqual(
          differenceWithEvents(mockEventState2, mockEventState2),
          [ ]
        )
      })
    })
  })

  describe('pascalToUpperSnake', () => {
    describe('when given \'TestName\'', () => {
      it('should return \'TEST_NAME\'', () => {
        assert.equal(pascalToUpperSnake('TestName'), 'TEST_NAME')
      })
    })
  })
})
