pragma solidity ^0.4.24;

import './ScalarPriceOracleBase.sol';

contract TimedOracle is ScalarPriceOracleBase {

  uint public resolutionDate;

  modifier resolutionDatePassed() {
    require(now > resolutionDate);
    _;
  }

  constructor(uint _resolutionDate) public {
    resolutionDate = _resolutionDate;
  }
}
