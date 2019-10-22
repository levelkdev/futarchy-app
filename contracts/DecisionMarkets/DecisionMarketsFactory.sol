pragma solidity ^0.4.24;

import "./IDecisionMarkets.sol";
import "./IDecisionMarketsFactory.sol";
import "./DecisionMarketsBase.sol";

/// @title Futarchy decision markets factory contract - creates futarchy decision markets
contract DecisionMarketsFactory is IDecisionMarketsFactory {

  /*
   *  Events
   */
  event DecisionMarketsCreation(
    address decisionCreator,
    address indexed creator,
    IDecisionMarkets decisionMarkets,
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
  EventFactory public eventFactory;
  StandardMarketWithPriceLoggerFactory public marketFactory;
  IDecisionMarkets public decisionMarketsMasterCopy;

  /*
   *  Public functions
   */
  /// @dev Constructor sets event factory contract
  /// @param _eventFactory Event factory contract
  /// @param _marketFactory Market factory contract
  constructor(IDecisionMarkets _decisionMarketsMasterCopy, EventFactory _eventFactory, StandardMarketWithPriceLoggerFactory _marketFactory)
    public
  {
    require(address(_eventFactory) != 0 && address(_marketFactory) != 0);
    decisionMarketsMasterCopy = _decisionMarketsMasterCopy;
    eventFactory = _eventFactory;
    marketFactory = _marketFactory;
  }

  /// @dev Creates a new Futarchy oracle contract
  /// @param decisionCreator Address that initiated decision market creation
  /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
  /// @param oracle Oracle contract used to resolve the event
  /// @param outcomeCount Number of event outcomes
  /// @param lowerBound Lower bound for event outcome
  /// @param upperBound Lower bound for event outcome
  /// @param marketMaker Market maker contract
  /// @param fee Market fee
  /// @param tradingPeriod Trading period before decision can be determined
  /// @param startDate Start date for price logging
  /// @return IDecisionMarkets futarchy decision markets contract
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
  )
    public
    returns (IDecisionMarkets decisionMarkets)
  {
    decisionMarkets = IDecisionMarkets(new DecisionMarketsProxy(
      decisionMarketsMasterCopy,
      decisionCreator,
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
    emit DecisionMarketsCreation(
      decisionCreator,
      msg.sender,
      decisionMarkets,
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
