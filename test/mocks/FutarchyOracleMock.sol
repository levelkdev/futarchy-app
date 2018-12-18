pragma solidity ^0.4.24;

contract FutarchyOracleMock {

  event MockFutarchyFunding(uint funding);
  event MockFutarchyClosing();

  bool public mock_isSet;
  int public mock_winningMarketIndex;

  function mock_setIsSet(bool _isSet) public {
    mock_isSet = _isSet;
  }

  function mock_setWinningMarketIndex(int _winningMarketIndex) public {
    mock_winningMarketIndex = _winningMarketIndex;
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
    emit MockFutarchyFunding(_funding);
  }

  function close() public {
    emit MockFutarchyClosing();
  }
}
