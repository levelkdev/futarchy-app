pragma solidity ^0.4.24;

import './ScalarPriceOracleBase.sol';
import './TimedOracle.sol';

/**
* Contract that allows IScalarPriceOracle to interface with
* Aragon's Oracle Manager App which uses tidbit oracle interface
*/
contract OracleManagerAdapter is ScalarPriceOracleBase, TimedOracle {

  address public medianDataFeed;
  uint public medianTimeFrame;
  int public outcome;
  bool public isSet;

  constructor(
    address _medianDataFeed,
    uint _medianTimeFrame,
    uint _resolutionDate
  ) public TimedOracle(_resolutionDate)
  {
    medianDataFeed = _medianDataFeed;
    medianTimeFrame = _medianTimeFrame;
  }

  /**
  * @dev consults tidbit dataFeed to calculate and set outcome
  */
  function setOutcome() public resolutionDatePassed {
    uint result;
    /* TODO: result = medianDataFeed.getMedianPrice(resolutionDate, resolutionDate + medianTimeFrame) */
    _setOutcome(int(result));
  }
}
