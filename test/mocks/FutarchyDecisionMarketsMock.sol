pragma solidity ^0.4.24;

import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';
import '@gnosis.pm/pm-contracts/contracts/Markets/Market.sol';

contract FutarchyDecisionMarketsMock {

  event MockFutarchyFunding(uint funding);
  event MockFutarchyClosing();

  bool public mock_isSet;
  int public mock_winningMarketIndex;
  uint public mock_refundAmount;
  bool public mock_closed;
  ERC20Gnosis public token;
  MockEvent public categoricalEvent;
  MarketMock[] public markets;

  constructor(address _token) public {
    token = ERC20Gnosis(_token);
    categoricalEvent = new MockEvent();
    markets.push(new MarketMock());
    markets.push(new MarketMock());
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
    require(!mock_isSet);
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

  function winningMarketIndex() public view returns(int) {
    return mock_winningMarketIndex;
  }

  function close() public {
    mock_closed = true;
    token.transfer(msg.sender, mock_refundAmount);
    markets[uint(mock_winningMarketIndex)].close();
    emit MockFutarchyClosing();
  }

  function getMarketByIndex(uint index) public view returns (MarketMock market) {
    market = markets[index];
  }

  function outcomeCanBeSet() public view returns (bool) {
    return true;
  }

  function getCategoricalEvent() public view returns (MockEvent) {
    return categoricalEvent;
  }
}

contract MarketMock is MarketData {
  MockEvent public eventContract;

  event MockMarketClosed();
  event MockSetStage(Stages _stage);

  constructor() public {
    eventContract = new MockEvent();
    stage = Stages.MarketFunded;
  }

  function mock_setStage(Stages _stage) public {
    stage = _stage;
    emit MockSetStage(_stage);
  }

  function close() public {
    require(stage == Stages.MarketFunded);
    stage = Stages.MarketClosed;
    emit MockMarketClosed();
  }
}

contract OracleMock {
  bool isSet;

  function isOutcomeSet() public returns (bool) {
    return isSet;
  }

  function mock_setIsSet(bool _isSet) public {
    isSet = _isSet;
  }
}

contract MockEvent {
  bool public mock_isSet;
  int public outcome;
  OracleMock public oracle;

  constructor() {
    oracle = new OracleMock();
  }

  function redeemWinnings() public returns (uint winnings) {
    winnings = 5;
  }

  function mock_setIsSet(bool _isSet) public {
    mock_isSet = _isSet;
  }

  function setOutcome() public {
    require(!mock_isSet);
    outcome = 0;
    mock_setIsSet(true);
  }

  function isOutcomeSet() public view returns (bool) {
    return mock_isSet;
  }
}
