import { accountsLoaded } from '../actions'
import accounts from './accounts'
import runSimplePropTest from '../test/runSimplePropTest'

const mockAccounts = ['0x123', '0x456']

runSimplePropTest({
  reducer: accounts,
  action: accountsLoaded({ accounts: mockAccounts }),
  propName: 'accounts',
  defaultValue: [],
  expectedValue: mockAccounts
})
