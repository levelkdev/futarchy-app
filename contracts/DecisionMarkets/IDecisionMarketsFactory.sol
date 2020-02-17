pragma solidity ^0.4.24;

import "./IDecisionMarkets.sol";
import "@levelk/pm-contracts/contracts/MarketMakers/MarketMaker.sol";

contract IDecisionMarketsFactory {
  /// @dev Creates a new IDecisionMarkets contract
  /// @param decisionCreator Address that initiated decision market creation
  /// @param collateralToken Tokens used as market collateral
  /// @param oracle Oracle contract used to resolve the markets
  /// @param outcomeCount Number of decision outcomes
  /// @param lowerBound Lower bound for market resolution
  /// @param upperBound Lower bound for market resolution
  /// @param marketMaker Market maker contract
  /// @param fee Market fee
  /// @param tradingPeriod Trading period for decision to be determined
  /// @param startDate Start date for the markets
  /// @return IDecisionMarkets contract
  function createDecisionMarkets(
    address decisionCreator,
    ERC20Gnosis collateralToken,
    Oracle oracle,
    uint8 outcomeCount,
    int lowerBound,
    int upperBound,
    MarketMaker marketMaker,
    uint24 fee,
    uint tradingPeriod,
    uint startDate
  ) public returns (IDecisionMarkets);
}
