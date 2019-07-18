pragma solidity ^0.4.24;

import './TimedOracle.sol';
import './ScalarPriceOracleBase.sol';

contract CentralizedTimedOracle is TimedOracle {
  address public owner;
  bool public outcomeSubmitted;

  modifier isOwner() {
    // Only owner is allowed to proceed
    require(msg.sender == owner);
    _;
  }

  constructor(
    address _owner,
    uint _resolutionDate
  ) public
    TimedOracle(_resolutionDate)
  {
    owner = _owner;
  }

  /**
  * @dev Sets event outcome if called by owner & resolution date has passed
  * @param _outcome outcome to be assigned
  */
  function setOutcome(int _outcome) public resolutionDatePassed isOwner {
    _setOutcome(_outcome);
  }
}
