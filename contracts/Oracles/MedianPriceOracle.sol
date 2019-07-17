pragma solidity ^0.4.24;

import 'token-price-oracles/contracts/DataFeeds/TimeMedianDataFeed.sol';
import './ScalarPriceOracleBase.sol';
import './TimedOracle.sol';

/**
* Contract that allows IScalarPriceOracle to interface with
* Aragon's Oracle Manager App which uses tidbit oracle interface
*/
contract MedianPriceOracle is ScalarPriceOracleBase, TimedOracle {
  using SafeMath for uint;

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
    bytes32 result;
    _requireValidStartIndex(startIndex);
    _requireValidEndIndex(endIndex);
    result = medianDataFeed.medianizeByIndices(startIndex, endIndex);
    _setOutcome(int(result));
  }

  // Internal Functions

  function _requireValidStartIndex(uint startIndex) internal {
    (, uint startDate) = medianDataFeed.resultByIndexFor(startIndex);
    require(startDate >= resolutionDate.sub(medianTimeframe), "start date must be within medianized timeframe");

    if (startIndex > 1) {
      (, uint prevDate) = medianDataFeed.resultByIndexFor(startIndex.sub(1));
      require(prevDate < resolutionDate.sub(medianTimeframe), "start date must be the first date within medianized timeframe");
    }
  }

  function _requireValidEndIndex(uint endIndex) internal {
    (, uint endDate) = medianDataFeed.resultByIndexFor(endIndex);
    require(endDate <= resolutionDate, "end date must be within medianized timeframe");

    if (medianDataFeed.doesIndexExistFor(endIndex.add(1))) {
      (, uint nextDate) = medianDataFeed.resultByIndexFor(endIndex.add(1));
      require(nextDate > resolutionDate, "end date must be the last date within medianized timeframe");
    }
  }
}
