pragma solidity ^0.4.24;

import './Oracles/IScalarPriceOracle.sol';
import './Oracles/IScalarPriceOracleFactory.sol';
import '@aragon/os/contracts/apps/AragonApp.sol';
import '@aragon/os/contracts/common/IForwarder.sol';
import '@aragon/os/contracts/lib/math/SafeMath64.sol';
import '@gnosis.pm/pm-contracts/contracts/Oracles/Oracle.sol';
import '@gnosis.pm/pm-contracts/contracts/Oracles/FutarchyOracleFactory.sol';
import '@gnosis.pm/pm-contracts/contracts/MarketMakers/LMSRMarketMaker.sol';
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';

contract Futarchy is AragonApp, IForwarder {
  using SafeMath for uint;
  using SafeMath64 for uint64;

  event StartDecision(uint indexed decisionId, address indexed creator, string metadata, FutarchyOracle futarchyOracle, int marketLowerBound, int marketUpperBound, uint startDate, uint decisionResolutionDate, uint priceResolutionDate);
  event ExecuteDecision(uint decisionId);
  event BuyMarketPositions(address trader, uint decisionId, uint tradeTime, uint collateralAmount, uint[2] yesPurchaseAmounts, uint[2] noPurchaseAmounts, uint[2] yesCosts, uint[2] noCosts, uint[4] marginalPrices);
  event SellMarketPositions(address trader, uint decisionId, uint tradeTime, int[] yesMarketPositions, int[] noMarketPositions, uint yesCollateralReceived, uint noCollateralReceived, uint[4] marginalPrices);
  event RedeemWinnings(address trader, uint decisionId, int winningIndex, uint winningsAmount);

  bytes32 public constant CREATE_DECISION_ROLE = keccak256("CREATE_DECISION_ROLE");

  FutarchyOracleFactory public futarchyOracleFactory;
  MiniMeToken public token;
  IScalarPriceOracleFactory public priceOracleFactory;
  LMSRMarketMaker public lmsrMarketMaker;
  uint24 public fee;
  uint public tradingPeriod;
  uint public timeToPriceResolution;
  uint public marketFundAmount;

  struct Decision {
    FutarchyOracle futarchyOracle;
    uint startDate;
    uint decisionResolutionDate;
    uint priceResolutionDate;
    bool resolved;
    bool passed;
    uint64 snapshotBlock;
    bool executed;
    string metadata;
    bytes executionScript;
    address decisionCreator;
  }

  struct OutcomeTokenBalances {
    uint yesCollateral;
    uint noCollateral;
    uint yesShort;
    uint yesLong;
    uint noShort;
    uint noLong;
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
    * @param _timeToPriceResolution Duration from start of prediction markets until date of final price resolution
    * @param _token token used to participate in prediction markets
    * @param _futarchyOracleFactory creates FutarchyOracle to begin new decision
    *         https://github.com/gnosis/pm-contracts/blob/v1.0.0/contracts/Oracles/FutarchyOracleFactory.sol
    * @param _priceOracleFactory oracle factory used to create oracles that resolve price after all trading is closed
    * @param _lmsrMarketMaker market maker library that calculates prediction market outomce token prices
    * FutarchyOracleFactory comes from Gnosis https://github.com/gnosis/pm-contracts/blob/v1.0.0/contracts/Oracles/FutarchyOracleFactory.sol
    **/
    function initialize(
      uint24 _fee,
      uint _tradingPeriod,
      uint _timeToPriceResolution,
      uint _marketFundAmount,
      MiniMeToken _token,
      FutarchyOracleFactory _futarchyOracleFactory,
      IScalarPriceOracleFactory _priceOracleFactory,
      LMSRMarketMaker _lmsrMarketMaker
    )
      onlyInit
      public
    {
      initialized();
      fee = _fee;
      tradingPeriod = _tradingPeriod;
      timeToPriceResolution = _timeToPriceResolution;
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
      string metadata,
      int lowerBound,
      int upperBound
    )
      public
      auth(CREATE_DECISION_ROLE)
      returns (uint decisionId)
    {
      decisionId = decisionLength++;

      uint startDate = now;
      uint decisionResolutionDate = startDate.add(tradingPeriod);
      uint priceResolutionDate = startDate.add(timeToPriceResolution);

      decisions[decisionId].startDate = startDate;
      decisions[decisionId].decisionResolutionDate = decisionResolutionDate;
      decisions[decisionId].priceResolutionDate = priceResolutionDate;
      decisions[decisionId].metadata = metadata;
      decisions[decisionId].snapshotBlock = getBlockNumber64() - 1;
      decisions[decisionId].executionScript = executionScript;
      decisions[decisionId].decisionCreator = msg.sender;

      FutarchyOracle futarchyOracle = futarchyOracleFactory.createFutarchyOracle(
        ERC20Gnosis(token),
        Oracle(priceOracleFactory.createOracle("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz", priceResolutionDate)),
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

      emit StartDecision(decisionId, msg.sender, metadata, futarchyOracle, lowerBound, upperBound, startDate, decisionResolutionDate, priceResolutionDate);
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
        uint startDate,
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

    function closeDecisionMarkets(uint decisionId) public {
      uint previousBalance = token.balanceOf(this);
      decisions[decisionId].futarchyOracle.close();
      uint newBalance = token.balanceOf(this);

      uint creatorRefund = newBalance - previousBalance;
      require(token.transfer(decisions[decisionId].decisionCreator, creatorRefund));
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
      require(decision.decisionResolutionDate < now);
      if (!decision.futarchyOracle.isOutcomeSet()) {
        decision.futarchyOracle.setOutcome();
      }
      require(decision.futarchyOracle.getOutcome() == 0); // 0 == YES; 1 == NO

      bytes memory input = new bytes(0); // TODO: (aragon comment) Consider including input for decision scripts
      runScript(decision.executionScript, input, new address[](0));

      decision.executed = true;
      emit ExecuteDecision(decisionId);
    }

    // Workaround solution to get the contract address. Would be better to get from
    // Aragon client
    function contractAddress() public view returns (address) {
      return this;
    }

    // Workaround solution to get current blocktime. Would be better to get from
    // Aragon client
    function blocktime() public view returns (uint) {
      return now;
    }

    /**
    * @notice buys outcome tokens in YES/NO decision markets for the sender
    * @param decisionId unique identifier for decision
    * @param collateralAmount amount of tokens sender will stake in market
    * @param yesPurchaseAmounts amount of YES market outcome tokens to purchase. 0 == short, 1 == long
    * @param noPurchaseAmounts amount of NO market outcome tokens to purchase. 0 == short, 1 == long
    * @return yesCosts and noCosts arrays of outcome token cost in collateral token
    */
    function buyMarketPositions(
      uint decisionId,
      uint collateralAmount,
      uint[2] yesPurchaseAmounts,
      uint[2] noPurchaseAmounts
    )
      public
      returns (uint[2] yesCosts, uint[2] noCosts)
    {
      // set necessary contracts
      CategoricalEvent categoricalEvent = decisions[decisionId].futarchyOracle.categoricalEvent();
      StandardMarket yesMarket = decisions[decisionId].futarchyOracle.markets(0);
      StandardMarket noMarket = decisions[decisionId].futarchyOracle.markets(1);

      require(token.transferFrom(msg.sender, this, collateralAmount));
      token.approve(categoricalEvent, collateralAmount);
      categoricalEvent.buyAllOutcomes(collateralAmount);
      categoricalEvent.outcomeTokens(0).approve(yesMarket, collateralAmount);
      categoricalEvent.outcomeTokens(1).approve(noMarket, collateralAmount);

      // buy market positions
      for(uint8 outcomeTokenIndex = 0; outcomeTokenIndex < 2; outcomeTokenIndex++) {
        if(yesPurchaseAmounts[outcomeTokenIndex] > 0) {
          yesCosts[outcomeTokenIndex] = yesMarket.buy(
            outcomeTokenIndex,
            yesPurchaseAmounts[outcomeTokenIndex],
            collateralAmount
          );
        }
        if(noPurchaseAmounts[outcomeTokenIndex] > 0) {
          noCosts[outcomeTokenIndex] = noMarket.buy(
            outcomeTokenIndex,
            noPurchaseAmounts[outcomeTokenIndex],
            collateralAmount
          );
        }
      }

      _addToTraderDecisionBalances(
        decisionId,
        [
          collateralAmount.sub(_calcTotalCost(yesCosts)),
          collateralAmount.sub(_calcTotalCost(noCosts))
        ],
        yesPurchaseAmounts,
        noPurchaseAmounts
      );

      uint[4] memory marginalPrices = calcMarginalPrices(decisionId);

      emit BuyMarketPositions(msg.sender, decisionId, now, collateralAmount, yesPurchaseAmounts, noPurchaseAmounts, yesCosts, noCosts, marginalPrices);
    }

    /* @notice sells all price prediction positions and adds rewarded collateral tokens to trader's yesCollateral and noCollateral balances
     * @param decisionId unique identifier for the decision
     */
    function sellMarketPositions(uint decisionId) {
      OutcomeTokenBalances storage outcomeTokenBalances = traderDecisionBalances[keccak256(msg.sender, decisionId)];

      // set necessary contracts
      FutarchyOracle futarchyOracle = decisions[decisionId].futarchyOracle;
      StandardMarket yesMarket = futarchyOracle.markets(0);
      StandardMarket noMarket = futarchyOracle.markets(1);

      // approve token transfers
      yesMarket.eventContract().outcomeTokens(1).approve(yesMarket, outcomeTokenBalances.yesLong);
      yesMarket.eventContract().outcomeTokens(0).approve(yesMarket, outcomeTokenBalances.yesShort);
      noMarket.eventContract().outcomeTokens(1).approve(noMarket, outcomeTokenBalances.noLong);
      noMarket.eventContract().outcomeTokens(0).approve(noMarket, outcomeTokenBalances.noShort);

      int[] memory yesSellPositions = _getMarketPositionsArray(decisionId, msg.sender, 0);
      int[] memory noSellPositions = _getMarketPositionsArray(decisionId, msg.sender, 1);

      // sell positions (market.trade() with negative numbers to perform a sell)
      int yesCollateralNetCost = yesMarket.trade(yesSellPositions, 0);
      int noCollateralNetCost  = noMarket.trade(noSellPositions, 0);

      // translate int netCost into uint collateral received (netCost will be a negative number representing a gain)
      uint yesCollateralReceived = uint(-yesCollateralNetCost);
      uint noCollateralReceived = uint(-noCollateralNetCost);

      // store updated balances
      outcomeTokenBalances.yesCollateral = outcomeTokenBalances.yesCollateral.add(yesCollateralReceived);
      outcomeTokenBalances.noCollateral = outcomeTokenBalances.noCollateral.add(noCollateralReceived);
      outcomeTokenBalances.yesLong = 0;
      outcomeTokenBalances.yesShort = 0;
      outcomeTokenBalances.noLong = 0;
      outcomeTokenBalances.noShort = 0;

      uint[4] memory marginalPrices = calcMarginalPrices(decisionId);

      emit SellMarketPositions(msg.sender, decisionId, now, yesSellPositions, noSellPositions, yesCollateralReceived, noCollateralReceived, marginalPrices);
    }

    /* @notice allocates token back to the sender based on their balance of the winning outcome collateralToken
     * @param decisionId unique identifier for the decision
     */
    function redeemTokenWinnings(uint decisionId) public {
      require(decisions[decisionId].decisionResolutionDate < now);

      FutarchyOracle futarchyOracle = decisions[decisionId].futarchyOracle;

      // set decision if not yet set
      if(!futarchyOracle.categoricalEvent().isOutcomeSet()) {
        if (!futarchyOracle.isOutcomeSet()) {
          futarchyOracle.setOutcome();
        }
        futarchyOracle.categoricalEvent().setOutcome();
      }

      int winningIndex = futarchyOracle.getOutcome();

      decisions[decisionId].resolved = true;
      decisions[decisionId].passed = winningIndex == 0 ? true : false;
      futarchyOracle.categoricalEvent().redeemWinnings();

      uint winnings;
      if (winningIndex == 0) {
        winnings = traderDecisionBalances[keccak256(msg.sender, decisionId)].yesCollateral;
        traderDecisionBalances[keccak256(msg.sender, decisionId)].yesCollateral = 0;
      } else {
        winnings = traderDecisionBalances[keccak256(msg.sender, decisionId)].noCollateral;
        traderDecisionBalances[keccak256(msg.sender, decisionId)].noCollateral = 0;
      }

      require(token.transfer(msg.sender, winnings));
      emit RedeemWinnings(msg.sender, decisionId, winningIndex, winnings);
    }

    /**
    * @notice calculates the amount of YES/NO collateral needed to buy the given amounts of
    *         YES-SHORT, YES-LONG, NO-SHORT, and NO-LONG on the YES or NO markets for the given
    *         decision
    * @param decisionId unique identifier for the decision
    * @param outcomeTokenAmounts array of 0: YES-SHORT, 1: YES-LONG, 2: NO-SHORT, and 3: NO-LONG
    *        outcome token amounts
    * @return array of YES/NO collateral amounts need to buy the given outcome token amounts
    */
    function calcCosts(
      uint decisionId,
      uint[4] outcomeTokenAmounts
    )
      public
      view
      returns (uint[4] collateralTokenAmounts)
    {
      for(uint8 i = 0; i < 4; i++) {
        uint8 yesOrNo = i < 2 ? 0 : 1;
        collateralTokenAmounts[i] = lmsrMarketMaker.calcCost(
          decisions[decisionId].futarchyOracle.markets(yesOrNo),
          i % 2,
          outcomeTokenAmounts[i]
        );
      }
    }

    /**
    * @notice calculates the amount of YES/NO collateral recieved from selling the given
    *         amounts of YES-SHORT, YES-LONG, NO-SHORT, and NO-LONG on the YES or NO markets
    *         for the given decision
    * @param decisionId unique identifier for the decision
    * @param outcomeTokenAmounts array of 0: YES-SHORT, 1: YES-LONG, 2: NO-SHORT, and 3: NO-LONG
    *        outcome token amounts
    * @return array of YES/NO collateral amounts that would be received for the sale of the
    *         given outcome token amounts
    */
    function calcProfits(
      uint decisionId,
      uint[4] outcomeTokenAmounts
    )
      public
      view
      returns (uint[4] collateralTokenAmounts)
    {
      for(uint8 i = 0; i < 4; i++) {
        uint8 yesOrNo = i < 2 ? 0 : 1;
        collateralTokenAmounts[i] = lmsrMarketMaker.calcProfit(
          decisions[decisionId].futarchyOracle.markets(yesOrNo),
          i % 2,
          outcomeTokenAmounts[i]
        );
      }
    }

    /**
    * @notice calculates the marginal prices of outcomes tokens on the YES and NO markets
    *         for the given decision
    * @param decisionId unique identifier for the decision
    * @return array of marginal prices for 0: YES-SHORT, 1: YES-LONG, 2: NO-SHORT, and
    *         3: NO-LONG outcomes
    */
    function calcMarginalPrices(
      uint decisionId
    )
      public
      view
      returns (uint[4] marginalPrices)
    {
      for(uint8 i = 0; i < 4; i++) {
        uint8 yesOrNo = i < 2 ? 0 : 1;
        marginalPrices[i] = lmsrMarketMaker.calcMarginalPrice(
          decisions[decisionId].futarchyOracle.markets(yesOrNo),
          i % 2
        );
      }
    }

    /**
    * @notice returns true if the trading period before making the decision has passed
    * @param decisionId decision unique identifier
    */
    function tradingPeriodEnded(uint decisionId) public view returns(bool) {
      Decision storage decision = decisions[decisionId];
      return now > decision.decisionResolutionDate;
    }

    function _addToTraderDecisionBalances(
      uint decisionId,
      uint[2] collateralAmounts,
      uint[2] yesOutcomeAmounts,
      uint[2] noOutcomeAmounts
    ) internal {
      OutcomeTokenBalances storage currentBalances = traderDecisionBalances[keccak256(msg.sender, decisionId)];
      currentBalances.yesCollateral = currentBalances.yesCollateral.add(collateralAmounts[0]);
      currentBalances.noCollateral = currentBalances.noCollateral.add(collateralAmounts[1]);
      currentBalances.yesShort = currentBalances.yesShort.add(yesOutcomeAmounts[0]);
      currentBalances.yesLong = currentBalances.yesLong.add(yesOutcomeAmounts[1]);
      currentBalances.noShort = currentBalances.noShort.add(noOutcomeAmounts[0]);
      currentBalances.noLong = currentBalances.noLong.add(noOutcomeAmounts[1]);
    }

    function _getMarketPositionsArray(uint decisionId, address trader, uint marketIndex) internal view returns(int[]) {
      OutcomeTokenBalances storage outcomeTokenBalances = traderDecisionBalances[keccak256(trader, decisionId)];
      int[] memory marketPositions = new int[](2);
      marketPositions[0] = marketIndex == 0 ? -int(outcomeTokenBalances.yesShort) : -int(outcomeTokenBalances.noShort);
      marketPositions[1] = marketIndex == 0 ? -int(outcomeTokenBalances.yesLong) : -int(outcomeTokenBalances.noLong);
      return marketPositions;
    }

    function _calcTotalCost(uint[2] costs) internal pure returns (uint) {
      return costs[0].add(costs[1]);
    }

    /**
    * @notice Sets outcome of the price oracle for a specified decision
    * @param price Price used to set oracle outcome
    * @param decisionId ID of price oracle's corresponding decision
    */
    function setPriceOutcome(
      uint decisionId,
      int price
    )
      public
      auth(CREATE_DECISION_ROLE)
    {
      IScalarPriceOracle priceOracle = IScalarPriceOracle(decisions[decisionId].futarchyOracle.markets(0).eventContract().oracle());
      priceOracle.setOutcome(price);
    }

    /* IForwarder API */

    /* @notice confirms Futarchy implements IForwarder */
    function isForwarder() external pure returns (bool) {
      return true;
    }


    /**
    * @notice Purpose is to be called with an evmCallScript that will execute newDecision()
    * @dev IForwarder interface conformance
    * @param evmCallScript a script expected to execute futarchy.newDecision()
    */
    function forward(bytes evmCallScript) public {
      require(canForward(msg.sender, evmCallScript));

      bytes memory input = new bytes(0);
      runScript(evmCallScript, input, new address[](0));
    }

    /**
    * @notice Confirms whether sender has permissions to forward the action
    * @dev IForwarder interface conformance
    * @param sender msg.sender
    * @param evmCallScript script to execute upon successful YES decision
    */
    function canForward(address sender, bytes evmCallScript) public view returns (bool) {
      return canPerform(sender, CREATE_DECISION_ROLE, arr());
    }
}
