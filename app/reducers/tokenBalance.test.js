import { tokenBalanceLoaded } from '../actions'
import tokenBalance from './tokenBalance'
import runSimplePropTest from '../test/runSimplePropTest'

const mockBalance = 123

runSimplePropTest({
  reducer: tokenBalance,
  action: tokenBalanceLoaded({ balance: mockBalance }),
  propName: 'tokenBalance',
  defaultValue: null,
  expectedValue: mockBalance
})
