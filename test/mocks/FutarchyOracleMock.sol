pragma solidity ^0.4.24;

import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';

contract FutarchyOracleMock {

  event MockFutarchyFunding(uint funding);
  event MockFutarchyClosing();

  bool public mock_isSet;
  int public mock_winningMarketIndex;
  uint public mock_refundAmount;
  bool public mock_closed;
  ERC20Gnosis public token;

  constructor(address _token) public {
    token = ERC20Gnosis(_token);
  }

  function mock_setIsSet(bool _isSet) public {
    mock_isSet = _isSet;
  }

  function mock_setWinningMarketIndex(int _winningMarketIndex) public {
    mock_winningMarketIndex = _winningMarketIndex;
  }

  function mock_setRefundAmount(uint _refundAmount) public {
    mock_refundAmount = _refundAmount;
  }

  function isOutcomeSet() public view returns (bool) {
    return mock_isSet;
  }

  function setOutcome() public {
    mock_isSet = true;
  }

  function getOutcome() public view returns (int) {
    return mock_winningMarketIndex;
  }

  function fund(uint _funding) public {
    token.transferFrom(msg.sender, this,  _funding);
    mock_setRefundAmount(_funding);
    emit MockFutarchyFunding(_funding);
  }

  function close() public {
    mock_closed = true;
    token.transfer(msg.sender, mock_refundAmount);
    emit MockFutarchyClosing();
  }
}
