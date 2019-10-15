pragma solidity ^0.4.24;

import "./IDecisionMarkets.sol";
import "./DecisionMarketsBase.sol";

contract FutarchyDecisionMarkets is IDecisionMarkets, Proxied, DecisionMarketsBase {

  /// @dev Allows to set the oracle outcome based on the market with largest long position
  function setOutcome()
    public
  {
    // Outcome is not set yet and trading period is over
    require(!isSet && StandardMarketWithPriceLogger(markets[0]).startDate() + tradingPeriod < now);
    // Find market with highest marginal price for long outcome tokens
    uint highestAvgPrice = StandardMarketWithPriceLogger(markets[0]).getAvgPrice();
    uint highestIndex = 0;
    for (uint8 i = 1; i < markets.length; i++) {
      uint avgPrice = StandardMarketWithPriceLogger(markets[i]).getAvgPrice();
      if (avgPrice > highestAvgPrice) {
        highestAvgPrice = avgPrice;
        highestIndex = i;
      }
    }
    winningMarketIndex = highestIndex;
    isSet = true;
    emit OutcomeAssignment(winningMarketIndex);
  }

  /// @dev Returns true if setOutcome can be successfully executed.
  ///      This is always the case in this implementation.
  /// @return True
  function outcomeCanBeSet()
    public
    view
    returns (bool)
  {
    return true;
  }
}
