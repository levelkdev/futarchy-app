pragma solidity ^0.4.24;

import './TimedOracle.sol';
import './ScalarPriceOracleBase.sol';

contract CentralizedTimedOracle is ScalarPriceOracleBase, TimedOracle {
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
  * @dev Sets event outcome if outcome has been submitted
  */
  function setOutcome() public {
    require(outcomeSubmitted);
    TimedOracle.setOutcome();
  }

  /**
  * @dev Submits event outcome value
  * @param _outcome Event outcome
  */
  function submitOutcome(int _outcome) public resolutionDatePassed isOwner {
    require(!outcomeSubmitted, 'outcome already submitted');
    outcomeSubmitted = true;
    outcome = _outcome;
    setOutcome();
  }
}
