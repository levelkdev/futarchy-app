pragma solidity ^0.4.24;

import "./IDecisionMarkets.sol";
import "@gnosis.pm/pm-contracts/contracts/Oracles/Oracle.sol";
import "@gnosis.pm/pm-contracts/contracts/Events/EventFactory.sol";
import "@gnosis.pm/pm-contracts/contracts/Markets/StandardMarketWithPriceLoggerFactory.sol";
import "@gnosis.pm/pm-contracts/contracts/GnosisUtilContracts/Proxy.sol";

contract FutarchyDecisionMarketsData {

  /*
   *  Events
   */
  event FutarchyFunding(uint funding);
  event FutarchyClosing();
  event OutcomeAssignment(uint winningMarketIndex);

  /*
   *  Constants
   */
  uint8 public constant LONG = 1;

  /*
   *  Storage
   */
  address creator;
  StandardMarketWithPriceLogger[] public markets;
  CategoricalEvent public categoricalEvent;
  uint public tradingPeriod;
  uint public winningMarketIndex;
  bool public isSet;

  /*
   *  Modifiers
   */
  modifier isCreator() {
    // Only creator is allowed to proceed
    require(msg.sender == creator);
    _;
  }
}

contract FutarchyDecisionMarketsProxy is Proxy, FutarchyDecisionMarketsData {

    /// @dev Constructor creates events and markets for futarchy oracle
    /// @param _creator Oracle creator
    /// @param eventFactory Event factory contract
    /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param oracle Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    /// @param lowerBound Lower bound for event outcome
    /// @param upperBound Lower bound for event outcome
    /// @param marketFactory Market factory contract
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @param _tradingPeriod Trading period before decision can be determined
    /// @param startDate Start date for price logging
    constructor(
      address proxied,
      address _creator,
      EventFactory eventFactory,
      ERC20Gnosis collateralToken,
      Oracle oracle,
      uint8 outcomeCount,
      int lowerBound,
      int upperBound,
      StandardMarketWithPriceLoggerFactory marketFactory,
      MarketMaker marketMaker,
      uint24 fee,
      uint _tradingPeriod,
      uint startDate
    )
      Proxy(proxied)
      public
    {
      // trading period is at least a second
      require(_tradingPeriod > 0);
      // Create decision event
      categoricalEvent = eventFactory.createCategoricalEvent(collateralToken, Oracle(this), outcomeCount);
      // Create outcome events
      for (uint8 i = 0; i < categoricalEvent.getOutcomeCount(); i++) {
        ScalarEvent scalarEvent = eventFactory.createScalarEvent(
          categoricalEvent.outcomeTokens(i),
          oracle,
          lowerBound,
          upperBound
        );
        markets.push(marketFactory.createMarket(scalarEvent, marketMaker, fee, startDate));
      }
      creator = _creator;
      tradingPeriod = _tradingPeriod;
    }
}

contract FutarchyDecisionMarkets is Proxied, Oracle, FutarchyDecisionMarketsData, IDecisionMarkets {
  using GnosisSafeMath for *;

  /*
   *  Public functions
   */
  /// @dev Funds all markets with equal amount of funding
  /// @param funding Amount of funding
  function fund(uint funding)
    public
    isCreator
  {
    // Buy all outcomes
    require(   categoricalEvent.collateralToken().transferFrom(creator, this, funding)
            && categoricalEvent.collateralToken().approve(categoricalEvent, funding));
    categoricalEvent.buyAllOutcomes(funding);
    // Fund each market with outcome tokens from categorical event
    for (uint8 i = 0; i < markets.length; i++) {
      Market market = markets[i];
      // Approve funding for market
      require(market.eventContract().collateralToken().approve(market, funding));
      market.fund(funding);
    }
    emit FutarchyFunding(funding);
  }

  /// @dev Closes market for winning outcome and redeems winnings and sends all collateral tokens to creator
  function close()
    public
    isCreator
  {
    // Winning outcome has to be set
    Market market = markets[uint(getOutcome())];
    require(categoricalEvent.isOutcomeSet() && market.eventContract().isOutcomeSet());
    // Close market and transfer all outcome tokens from winning outcome to this contract
    market.close();
    market.eventContract().redeemWinnings();
    market.withdrawFees();
    // Redeem collateral token for winning outcome tokens and transfer collateral tokens to creator
    categoricalEvent.redeemWinnings();
    require(categoricalEvent.collateralToken().transfer(creator, categoricalEvent.collateralToken().balanceOf(this)));
    emit FutarchyClosing();
  }

  /// @dev Allows to set the oracle outcome based on the market with largest long position
  function setOutcome()
    public
  {
    // Outcome is not set yet and trading period is over
    require(!isSet && markets[0].startDate() + tradingPeriod < now);
    // Find market with highest marginal price for long outcome tokens
    uint highestAvgPrice = markets[0].getAvgPrice();
    uint highestIndex = 0;
    for (uint8 i = 1; i < markets.length; i++) {
      uint avgPrice = markets[i].getAvgPrice();
      if (avgPrice > highestAvgPrice) {
        highestAvgPrice = avgPrice;
        highestIndex = i;
      }
    }
    winningMarketIndex = highestIndex;
    isSet = true;
    emit OutcomeAssignment(winningMarketIndex);
  }

  /// @dev Returns if winning outcome is set
  /// @return Is outcome set?
  function isOutcomeSet()
    public
    view
    returns (bool)
  {
    return isSet;
  }

  /// @dev Returns winning outcome
  /// @return Outcome
  function getOutcome()
    public
    view
    returns (int)
  {
    return int(winningMarketIndex);
  }

  /// @dev Returns market by index
  /// @param index Index of the market
  /// @return Market
  function getMarketByIndex(uint index)
    public
    view
    returns (Market)
  {
    return markets[index];
  }

  /// @dev Returns categorical event
  /// @return Categorical event
  function getCategoricalEvent()
    public
    view
    returns (CategoricalEvent)
  {
    return categoricalEvent;
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
