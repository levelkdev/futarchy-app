pragma solidity ^0.4.24;
import "./FutarchySignalingOracle.sol";
import '@gnosis.pm/pm-contracts/contracts/Events/EventFactory.sol';
import '@gnosis.pm/pm-contracts/contracts/Markets/StandardMarketWithPriceLoggerFactory.sol';

contract FutarchySignalingOracleFactory {

    /*
     *  Events
     */
    event FutarchySignalingOracleCreation(
        address indexed creator,
        address outcomeAdmin,
        FutarchySignalingOracle futarchySignalingOracle,
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
    FutarchySignalingOracle public futarchySignalingOracleMasterCopy;
    address public outcomeAdmin;

    /*
     *  Public functions
     */
    /// @dev Constructor sets event factory contract
    /// @param _eventFactory Event factory contract
    /// @param _marketFactory Market factory contract
    /// @param _outcomeAdmin Address for outcomeAdmin
    constructor(
      FutarchySignalingOracle _futarchySignalingOracleMasterCopy,
      EventFactory _eventFactory,
      StandardMarketWithPriceLoggerFactory _marketFactory,
      address _outcomeAdmin
    )
        public
    {
        require(address(_eventFactory) != 0);
        require(address(_marketFactory) != 0);
        require(address(_futarchySignalingOracleMasterCopy) != 0);
        require(address(_outcomeAdmin) != 0);

        eventFactory = _eventFactory;
        marketFactory = _marketFactory;
        futarchySignalingOracleMasterCopy = _futarchySignalingOracleMasterCopy;
        outcomeAdmin = _outcomeAdmin;
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
    function createFutarchyOracle(
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
        returns (FutarchySignalingOracle futarchyOracle)
    {
        futarchyOracle = FutarchySignalingOracle(new FutarchySignalingOracleProxy(
            outcomeAdmin,
            futarchySignalingOracleMasterCopy,
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
        emit FutarchySignalingOracleCreation(
            msg.sender,
            outcomeAdmin,
            futarchyOracle,
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
