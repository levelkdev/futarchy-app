pragma solidity ^0.4.24;

contract TimedOracle {

  uint public resolutionDate;

  modifier resolutionDatePassed() {
    require(now > resolutionDate);
    _;
  }

  constructor(uint _resolutionDate) public {
    resolutionDate = _resolutionDate;
  }
}
