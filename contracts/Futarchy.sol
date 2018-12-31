pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";
import "@aragon/os/contracts/lib/math/SafeMath64.sol";
import '@gnosis.pm/pm-contracts/contracts/Oracles/FutarchyOracleFactory.sol';
import '@gnosis.pm/pm-contracts/contracts/MarketMakers/LMSRMarketMaker.sol';
import '@gnosis.pm/pm-contracts/contracts/Oracles/CentralizedOracleFactory.sol';
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';

contract Futarchy is AragonApp {
  using SafeMath for uint;
  using SafeMath64 for uint64;

  event StartDecision(uint indexed decisionId, address indexed creator, string metadata, FutarchyOracle futarchyOracle);
  event ExecuteDecision(uint decisionId);

  bytes32 public constant CREATE_DECISION_ROLE = keccak256("CREATE_DECISION_ROLE");

  FutarchyOracleFactory public futarchyOracleFactory;
  MiniMeToken public token;
  CentralizedOracleFactory public priceOracleFactory;
  LMSRMarketMaker public lmsrMarketMaker;
  uint24 public fee;
  uint public tradingPeriod;
  uint public marketFundAmount;

  struct Decision {
    FutarchyOracle futarchyOracle;
    uint64 startDate;
    uint tradingPeriod;
    uint64 snapshotBlock;
    bool executed;
    string metadata;
    bytes executionScript;
  }

  struct OutcomeTokenBalances {
    uint yesCollateral;
    uint noCollateral;
    uint yesLong;
    uint yesShort;
    uint noLong;
    uint noShort;
  }

  mapping(uint256 => Decision) public decisions;
  uint public decisionLength;

  mapping(bytes32 => OutcomeTokenBalances) public traderDecisionBalances;

  modifier decisionExists(uint256 _decisionId) {
      require(_decisionId < decisionLength);
      _;
  }

    /**
    * @notice initialize Futarchy app with state
    * @param _fee Percent trading fee prediction markets will collect
    * @param _tradingPeriod trading period before decision can be determined
    * @param _token token used to participate in prediction markets
    * @param _futarchyOracleFactory creates FutarchyOracle to begin new decision
    *         https://github.com/gnosis/pm-contracts/blob/v1.0.0/contracts/Oracles/FutarchyOracleFactory.sol
    * @param _priceOracleFactory oracle factory used to create oracles that resolve price after all trading is closed
    * @param _lmsrMarketMaker market maker library that calculates prediction market outomce token prices
    * FutarchyOracleFactory comes from Gnosis https://github.com/gnosis/pm-contracts/blob/v1.0.0/contracts/Oracles/FutarchyOracleFactory.sol
    * TODO: BoundsOracle - Calculates the upper and lower bounds for creating a new FutarchyOracle
    * TODO: PriceFeedOracle - Is used to resolve all futarchy decision markets
    **/
    function initialize(
      uint24 _fee,
      uint _tradingPeriod,
      uint _marketFundAmount,
      MiniMeToken _token,
      FutarchyOracleFactory _futarchyOracleFactory,
      CentralizedOracleFactory _priceOracleFactory,
      LMSRMarketMaker _lmsrMarketMaker
    )
      onlyInit
      public
    {
      initialized();
      fee = _fee;
      tradingPeriod = _tradingPeriod;
      marketFundAmount = _marketFundAmount;
      token = _token;
      futarchyOracleFactory = _futarchyOracleFactory;
      priceOracleFactory = _priceOracleFactory;
      lmsrMarketMaker = _lmsrMarketMaker;
    }


    /**
    * @notice creates a new futarchy decision market related to `metadata`
    * @param executionScript EVM script to be executed on approval
    * @param metadata Decision metadata
    **/
    function newDecision(
      bytes executionScript,
      string metadata
    )
      public
      auth(CREATE_DECISION_ROLE)
      returns (uint decisionId)
    {
      int lowerBound;
      int upperBound;
      decisionId = decisionLength++;
      uint64 startDate = getTimestamp64();
      decisions[decisionId].startDate = startDate;
      decisions[decisionId].tradingPeriod = tradingPeriod; // set tradingPeriod to protect against future variable updates
      decisions[decisionId].metadata = metadata;
      decisions[decisionId].snapshotBlock = getBlockNumber64() - 1;
      decisions[decisionId].executionScript = executionScript;
      (lowerBound, upperBound) = _calculateBounds();

      FutarchyOracle futarchyOracle = futarchyOracleFactory.createFutarchyOracle(
        ERC20Gnosis(token),
        priceOracleFactory.createCentralizedOracle("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz"),
        2,
        lowerBound,
        upperBound,
        lmsrMarketMaker,
        fee,
        tradingPeriod,
        startDate
      );
      decisions[decisionId].futarchyOracle = futarchyOracle;

      require(token.transferFrom(msg.sender, this, marketFundAmount));
      require(token.approve(futarchyOracle, marketFundAmount));
      futarchyOracle.fund(marketFundAmount);

      emit StartDecision(decisionId, msg.sender, metadata, decisions[decisionId].futarchyOracle);
    }

    /**
    * @notice returns data about decision
    * @param decisionId decision unique identifier
    **/
    function getDecision(uint decisionId)
      public
      view
      decisionExists(decisionId)
      returns (
        bool open,
        bool executed,
        uint64 startDate,
        uint64 snapshotBlock,
        uint marketPower,
        bytes script

        )
    {
      Decision storage decision = decisions[decisionId];
      open = !decision.futarchyOracle.isOutcomeSet();
      executed = decision.executed;
      startDate = decision.startDate;
      marketPower = token.totalSupplyAt(decision.snapshotBlock);
      snapshotBlock = decision.snapshotBlock;
      script = decision.executionScript;
    }

    /**
    * TODO: enable special permissions for executing decisions
    * TODO: create data to signal "cannot execute, so don't even try" (??)
    * @notice execute decision if final decision is ready and equals YES; otherwise Revert
    * @param decisionId decision unique identifier
    */
    function executeDecision(uint decisionId) public {
      Decision storage decision = decisions[decisionId];

      require(!decision.executed);
      require(tradingPeriodEnded(decisionId));
      if (!decision.futarchyOracle.isOutcomeSet()) {
        decision.futarchyOracle.setOutcome();
      }
      require(decision.futarchyOracle.getOutcome() == 0); // 0 == YES; 1 == NO

      bytes memory input = new bytes(0); // TODO: (aragon comment) Consider including input for decision scripts
      runScript(decision.executionScript, input, new address[](0));

      decision.executed = true;
      emit ExecuteDecision(decisionId);
    }

    event DebugTrade(address trader, uint tokenAmount);

    function trade(
      uint decisionId,
      uint tokenAmount,
      uint8 yesMarketOutcome,
      uint8 noMarketOutcome
    )
      public
    {
      Decision storage decision = decisions[decisionId];
      Event yesNoCategorical = decision.futarchyOracle.categoricalEvent();
      Market yesMarket = decision.futarchyOracle.markets(0);
      Market noMarket = decision.futarchyOracle.markets(1);

      require(token.transferFrom(msg.sender, this, tokenAmount));
      require(token.approve(yesNoCategorical, tokenAmount));

      yesNoCategorical.buyAllOutcomes(tokenAmount);

      emit DebugTrade(msg.sender, tokenAmount);
    }

    // Workaround solution to get the contract address. Would be better to get from
    // Aragon client
    function contractAddress() public view returns (address) {
      return this;
    }

    /**
    * @notice trades in decision market on users behalf
    * @param decisionId unique identifier for decision
    * @param stakeAmount amount of tokens sender will stake in market
    * @param yesPrediction 0 == long, 1 == short
    * @param noPrediction 0 == long, 1 == short
    * @param yesPurchaseAmount amount of YES market outcome tokens to purchase
    * @param noPurchaseAmount amount of NO market outcome tokens to purchase
    */
    function tradeInMarkets(
      uint decisionId,
      uint stakeAmount,
      uint8 yesPrediction,
      uint8 noPrediction,
      uint yesPurchaseAmount,
      uint noPurchaseAmount
    ) public {
      // make these local vars for now to avoid 'CompilerError: Stack too deep' (??)
      uint id = decisionId;
      uint collateralAmount = stakeAmount;

      // set necessary contracts
      Decision storage decision = decisions[id];
      FutarchyOracle futarchyOracle = decision.futarchyOracle;
      CategoricalEvent categoricalEvent = futarchyOracle.categoricalEvent();
      StandardMarket yesMarket = futarchyOracle.markets(0);
      StandardMarket noMarket = futarchyOracle.markets(1);

      // buy market positions
      require(token.transferFrom(msg.sender, this, collateralAmount));
      token.approve(categoricalEvent, collateralAmount);
      categoricalEvent.buyAllOutcomes(collateralAmount);
      categoricalEvent.outcomeTokens(0).approve(yesMarket, collateralAmount);
      categoricalEvent.outcomeTokens(1).approve(noMarket, collateralAmount);
      uint yesCost = yesMarket.buy(yesPrediction, yesPurchaseAmount, collateralAmount);
      uint noCost = noMarket.buy(noPrediction, noPurchaseAmount, collateralAmount);

      // set OutcomeTokenBalances data for msg.sender
      OutcomeTokenBalances storage outcomeTokenBalances = traderDecisionBalances[keccak256(msg.sender, id)];
      outcomeTokenBalances.yesCollateral = outcomeTokenBalances.yesCollateral.add((collateralAmount.sub(yesCost)));
      outcomeTokenBalances.noCollateral = outcomeTokenBalances.noCollateral.add((collateralAmount.sub(noCost)));
      if (yesPrediction == 0) { outcomeTokenBalances.yesLong = outcomeTokenBalances.yesLong.add(yesPurchaseAmount); }
      if (yesPrediction == 1) { outcomeTokenBalances.yesShort = outcomeTokenBalances.yesShort.add(yesPurchaseAmount); }
      if (noPrediction == 0) { outcomeTokenBalances.noLong = outcomeTokenBalances.noLong.add(noPurchaseAmount); }
      if (noPrediction == 1) { outcomeTokenBalances.noShort = outcomeTokenBalances.noShort.add(yesPurchaseAmount); }
    }

    /**
    * @notice returns true if the trading period before making the decision has passed
    * @param decisionId decision unique identifier
    */
    function tradingPeriodEnded(uint decisionId) public view returns(bool) {
      Decision storage decision = decisions[decisionId];
      return (now > decision.startDate.add(uint64(decision.tradingPeriod)));
    }


    /* TODO: actually get real bounds */
    function _calculateBounds() internal returns(int lowerBound, int upperBound) {
      lowerBound = 0;
      upperBound = 100;
    }

    /* IForwarder API */

    /* @notice confirms Futarchy implements IForwarder */
    function isForwarder() external pure returns (bool) {
      return true;
    }

    /**
    * @notice Creates a new decision to execute the desired action
    * @dev IForwarder interface conformance
    * @param evmCallScript executionScript for a successful YES decision
    */
    function forward(bytes evmCallScript) public {
      require(canForward(msg.sender, evmCallScript));
      newDecision(evmCallScript, '');
    }

    /**
    * @notice Confirms whether sender has permissions to forward the action
    * @dev IForwarder interface conformance
    * @param sender msg.sender
    * @param evmCallScript script to execute upon successful YES decision
    */
    function canForward(address sender, bytes evmCallScript) public returns (bool) {
      return canPerform(sender, CREATE_DECISION_ROLE, arr());
    }
}
