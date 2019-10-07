pragma solidity ^0.4.24;

import "./IDecisionMarketsFactory.sol";
import "./FutarchyDecisionMarkets.sol";

/// @title Futarchy decision markets factory contract - creates futarchy decision markets
contract FutarchyDecisionMarketsFactory is IDecisionMarketsFactory {

  /*
   *  Events
   */
  event FutarchyDecisionMarketsCreation(
    address indexed creator,
    FutarchyDecisionMarkets futarchyDecisionMarkets,
    ERC20Gnosis collateralToken,
    Oracle oracle,
    uint8 outcomeCount,
    int lowerBound,
    int upperBound,
    MarketMaker marketMaker,
    uint24 fee,
    uint tradingPeriod,
    uint startDate
  );

  /*
   *  Storage
   */
  EventFactory eventFactory;
  StandardMarketWithPriceLoggerFactory marketFactory;
  FutarchyDecisionMarkets public futarchyDecisionMarketsMasterCopy;

  /*
   *  Public functions
   */
  /// @dev Constructor sets event factory contract
  /// @param _eventFactory Event factory contract
  /// @param _marketFactory Market factory contract
  constructor(FutarchyDecisionMarkets _futarchyDecisionMarketsMasterCopy, EventFactory _eventFactory, StandardMarketWithPriceLoggerFactory _marketFactory)
    public
  {
    require(address(_eventFactory) != 0 && address(_marketFactory) != 0);
    futarchyDecisionMarketsMasterCopy = _futarchyDecisionMarketsMasterCopy;
    eventFactory = _eventFactory;
    marketFactory = _marketFactory;
  }

  /// @dev Creates a new Futarchy oracle contract
  /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
  /// @param oracle Oracle contract used to resolve the event
  /// @param outcomeCount Number of event outcomes
  /// @param lowerBound Lower bound for event outcome
  /// @param upperBound Lower bound for event outcome
  /// @param marketMaker Market maker contract
  /// @param fee Market fee
  /// @param tradingPeriod Trading period before decision can be determined
  /// @param startDate Start date for price logging
  /// @return Oracle contract
  function createDecisionMarkets(
    ERC20Gnosis collateralToken,
    Oracle oracle,
    uint8 outcomeCount,
    int lowerBound,
    int upperBound,
    MarketMaker marketMaker,
    uint24 fee,
    uint tradingPeriod,
    uint startDate
  )
    public
    returns (IDecisionMarkets futarchyDecisionMarkets)
  {
    futarchyDecisionMarkets = IDecisionMarkets(new FutarchyDecisionMarketsProxy(
      futarchyDecisionMarketsMasterCopy,
      msg.sender,
      eventFactory,
      collateralToken,
      oracle,
      outcomeCount,
      lowerBound,
      upperBound,
      marketFactory,
      marketMaker,
      fee,
      tradingPeriod,
      startDate
    ));
    emit FutarchyDecisionMarketsCreation(
      msg.sender,
      FutarchyDecisionMarkets(futarchyDecisionMarkets),
      collateralToken,
      oracle,
      outcomeCount,
      lowerBound,
      upperBound,
      marketMaker,
      fee,
      tradingPeriod,
      startDate
    );
  }
}
