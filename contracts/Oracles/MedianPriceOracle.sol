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
  uint public medianStartDate;
  int public outcome;
  bool public isSet;

  constructor(
    address _medianDataFeed,
    uint medianTimeframe,
    uint _resolutionDate
  )
    public
    TimedOracle(_resolutionDate)
  {
    medianDataFeed = TimeMedianDataFeed(_medianDataFeed);
    medianStartDate = _resolutionDate.sub(medianTimeframe);
  }

  /**
  * @notice Throws if resolution date has not passed.
  * @dev    Gets a medianized result from the TimeMedianDataFeed contract and sets the outcome
  *         with the result.
  * @param startIndex Index for first date in datafeed dates array within resolution timeframe
  *                   or the first index after timeframe if no results recorded within timeframe
  * @param endIndex   Index of final date in datafeed dates array within resolution timeframe
  *                   or the first date after timeframe if no results recorded within timeframe
  */
  function setOutcome(uint startIndex, uint endIndex)
    public
    resolutionDatePassed
  {
    bytes32 result;
    require(_isValidRange(startIndex, endIndex));
    result = medianDataFeed.medianizeByIndices(startIndex, endIndex);

    _setOutcome(int(result));
  }

  // Internal Functions

  function _isValidRange(uint startIndex, uint endIndex)
    internal
    returns (bool)
  {
    return (_isValidStartIndex(startIndex) && _isValidEndIndex(endIndex)) ||
      _validForNoResultsDuringTimeframe(startIndex, endIndex);
  }

  function _isValidStartIndex(uint startIndex)
    internal
    returns (bool)
  {
    (, uint startDate) = medianDataFeed.resultByIndex(startIndex);

    bool startIndexWithinTimeframe = startDate >= medianStartDate;
    bool previousIndexBeforeTimeframe = true;

    if (startIndex > 1) {
      (, uint prevDate) = medianDataFeed.resultByIndex(startIndex.sub(1));
      previousIndexBeforeTimeframe = prevDate < medianStartDate;
    }

    return startIndexWithinTimeframe && previousIndexBeforeTimeframe;
  }

  function _isValidEndIndex(uint endIndex)
    internal
    returns (bool)
  {
    (, uint endDate) = medianDataFeed.resultByIndex(endIndex);

    bool endIndexWithinTimeframe = endDate <= resolutionDate;
    bool nextIndexAfterTimeframe = true;

    if (medianDataFeed.indexHasResult(endIndex.add(1))) {
      (, uint nextDate) = medianDataFeed.resultByIndex(endIndex.add(1));
      nextIndexAfterTimeframe = nextDate > resolutionDate;
    }

    return endIndexWithinTimeframe && nextIndexAfterTimeframe;
  }

  function _validForNoResultsDuringTimeframe(uint startIndex, uint endIndex)
    internal
    returns (bool)
  {
    (, uint startDate) = medianDataFeed.resultByIndex(startIndex);
    (, uint prevDate) = medianDataFeed.resultByIndex(startIndex.sub(1));

    bool matchingIndices = startIndex == endIndex;
    bool previousDateBeforeTimeframe = prevDate < medianStartDate;
    bool startDateAfterTimeframe = startDate > resolutionDate;
    bool noResultsDuringTimeframe = previousDateBeforeTimeframe && startDateAfterTimeframe;

    return matchingIndices && noResultsDuringTimeframe;
  }
}
