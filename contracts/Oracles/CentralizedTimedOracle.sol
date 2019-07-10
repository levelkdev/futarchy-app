pragma solidity ^0.4.24;

import './TimedOracle.sol';
import './ScalarPriceOracleBase.sol';

contract CentralizedTimedOracle is TimedOracle {
  address public owner;
  bytes public ipfsHash;
  bool public outcomeSubmitted;

  modifier isOwner() {
    // Only owner is allowed to proceed
    require(msg.sender == owner);
    _;
  }

  constructor(
    address _owner,
    bytes _ipfsHash,
    uint _resolutionDate
  ) public
    TimedOracle(_resolutionDate)
  {
    owner = _owner;
    ipfsHash = _ipfsHash;
  }

  /**
  * @dev Sets event outcome if called by owner & resolution date has passed
  */
  function setOutcome(int _outcome) public resolutionDatePassed isOwner {
    _setOutcome(_outcome);
  }
}
