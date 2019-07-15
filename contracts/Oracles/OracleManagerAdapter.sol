pragma solidity ^0.4.24;

import 'token-price-oracles/contracts/DataFeeds/TimeMedianDataFeed.sol';
import './ScalarPriceOracleBase.sol';
import './TimedOracle.sol';

/**
* Contract that allows IScalarPriceOracle to interface with
* Aragon's Oracle Manager App which uses tidbit oracle interface
*/
contract OracleManagerAdapter is ScalarPriceOracleBase, TimedOracle {

  TimeMedianDataFeed public medianDataFeed;
  uint public medianTimeframe;
  uint public resolutionDate;
  int public outcome;
  bool public isSet;

  constructor(
    address _medianDataFeed,
    uint _medianTimeframe,
    uint _resolutionDate
  ) public TimedOracle(_resolutionDate)
  {
    medianDataFeed = TimeMedianDataFeed(_medianDataFeed);
    medianTimeframe = _medianTimeframe;
    resolutionDate = _resolutionDate;
  }

  /**
  * @dev consults tidbit dataFeed to calculate and set outcome
  * @param startIndex index for first date in datafeed dates array within resolution timeframe
  * @param endIndex index of final date in datafeed dates array within resolution timeframe
  */
  function setOutcome(uint startIndex, uint endIndex) public resolutionDatePassed {
    uint result;
    /* result = medianDataFeed.getMedianByIndices(startIndex, endIndex); */
    _setOutcome(int(result));
  }

  /* function _startIndexMatchesTimeframe(uint startIndex) internal returns (bool) { */
    /* require(medianDataFeed.dates(startIndex - 1) ) */
    /* return true; */
  /* } */
}
