import '@gnosis.pm/pm-contracts/contracts/Oracles/FutarchyOracle.sol';

contract FutarchySignalingOracleData {
  address public outcomeAdmin;

  modifier isOutcomeAdmin() {
    require(msg.sender == outcomeAdmin);
    _;
  }
}

contract FutarchySignalingOracleProxy is FutarchyOracleProxy, FutarchySignalingOracleData {
  constructor (
    address _outcomeAdmin,
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
    public
    FutarchyOracleProxy (
      proxied,
      _creator,
      eventFactory,
      collateralToken,
      oracle,
      outcomeCount,
      lowerBound,
      upperBound,
      marketFactory,
      marketMaker,
      fee,
      _tradingPeriod,
      startDate
    )
  {
    outcomeAdmin = _outcomeAdmin;
  }
}

contract FutarchySignalingOracle is FutarchyOracle, FutarchySignalingOracleData {
  function setExternalOutcome(uint outcome)
    isOutcomeAdmin
    public
  {
    require(outcome <= 1);
    require(!isSet && markets[0].startDate() + tradingPeriod < now);
    winningMarketIndex = outcome;
    isSet = true;
    emit OutcomeAssignment(winningMarketIndex);
  }

  function setOutcome()
    public
  {
    revert();
  }
}
