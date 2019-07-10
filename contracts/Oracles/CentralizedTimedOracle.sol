pragma solidity ^0.4.24;

import './TimedOracle.sol';
import './ScalarPriceOracleBase.sol';

contract CentralizedTimedOracle is ScalarPriceOracleBase, TimedOracle {
  address public owner;
  bytes public ipfsHash;
  bool public outcomeSubmitted;

  event OutcomeSubmitted(int _outcome);

  modifier isOwner () {
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
  * @dev Sets event outcome
  */
  function setOutcome() public resolutionDatePassed {
    ScalarPriceOracleBase.setOutcome(outcome);
  }

  /**
  * @dev Submits event outcome value
  * @param _outcome Event outcome
  */
  function submitOutcome(int _outcome) public resolutionDatePassed isOwner {
    require(!outcomeSubmitted, 'outcome already submitted');
    outcomeSubmitted = true;
    outcome = _outcome;
    emit OutcomeSubmitted(outcome);
  }
}
