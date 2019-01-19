pragma solidity ^0.4.24;

contract TimedOracle {

  uint _resolutionDate;

  modifier resolutionDatePassed() {
    require(now > _resolutionDate);
    _;
  }

  constructor(uint resolutionDate) public {
    _resolutionDate = resolutionDate;
  }

  function resolutionDate() public view returns (uint) {
    return _resolutionDate;
  }

}
