pragma solidity ^0.4.24;

import 'token-price-oracles/contracts/DataFeeds/TimeMedianDataFeed.sol';
import './ScalarPriceOracleBase.sol';
import './TimedOracle.sol';

/**
* Contract that allows IScalarPriceOracle to interface with
* tidbit price feeds via https://github.com/levelkdev/token-price-oracles
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
    require(_isValidStartIndex(startIndex));
    require(_isValidEndIndex(endIndex));
    result = medianDataFeed.medianizeByIndices(startIndex, endIndex);
    _setOutcome(int(result));
  }

  // Internal Functions

  function _isValidStartIndex(uint startIndex) internal returns (bool) {
    (, uint startDate) = medianDataFeed.resultByIndexFor(startIndex);
    bool startIndexWithinTimeframe = startDate >= resolutionDate.sub(medianTimeframe);

    bool firstAvailableStartIndex = true;
    if (startIndex > 1) {
      (, uint prevDate) = medianDataFeed.resultByIndexFor(startIndex.sub(1));
      firstAvailableStartIndex = prevDate < resolutionDate.sub(medianTimeframe);
    }

    return startIndexWithinTimeframe && firstAvailableStartIndex;
  }

  function _isValidEndIndex(uint endIndex) internal returns (bool) {
    (, uint endDate) = medianDataFeed.resultByIndexFor(endIndex);
    bool endIndexWithinTimeframe = endDate <= resolutionDate;

    bool lastAvailableEndIndex = true;
    if (medianDataFeed.doesIndexExistFor(endIndex.add(1))) {
      (, uint nextDate) = medianDataFeed.resultByIndexFor(endIndex.add(1));
      lastAvailableEndIndex = nextDate > resolutionDate;
    }

    return endIndexWithinTimeframe && lastAvailableEndIndex;
  }
}
