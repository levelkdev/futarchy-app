pragma solidity ^0.4.24;

import './DecisionLib.sol';
import './Oracles/IScalarPriceOracleFactory.sol';
import './DecisionMarkets/IDecisionMarketsFactory.sol';
import '@aragon/os/contracts/apps/AragonApp.sol';
import '@aragon/os/contracts/common/IForwarder.sol';
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import '@gnosis.pm/pm-contracts/contracts/Oracles/Oracle.sol';
import '@gnosis.pm/pm-contracts/contracts/MarketMakers/LMSRMarketMaker.sol';
import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';

contract Futarchy is AragonApp, IForwarder {
  using SafeMath for uint;
  using DecisionLib for DecisionLib.Decision;

  event StartDecision(uint indexed decisionId, address indexed creator, string metadata, IDecisionMarkets decisionMarkets, int marketLowerBound, int marketUpperBound, uint startDate, uint decisionResolutionDate, uint priceResolutionDate);
  event ExecuteDecision(uint decisionId);
  event BuyMarketPositions(address trader, uint decisionId, uint tradeTime, uint collateralAmount, uint[2] yesPurchaseAmounts, uint[2] noPurchaseAmounts, uint[2] yesCosts, uint[2] noCosts, uint[4] marginalPrices);
  event SellMarketPositions(address trader, uint decisionId, uint tradeTime, int[] yesMarketPositions, int[] noMarketPositions, uint yesCollateralReceived, uint noCollateralReceived, uint[4] marginalPrices);
  event RedeemWinningCollateralTokens(address trader, uint decisionId, int winningIndex, uint winningsAmount);
  event RedeemScalarWinnings(uint decisionId, address trader, uint winnings);

  bytes32 public constant CREATE_DECISION_ROLE = keccak256("CREATE_DECISION_ROLE");

  IDecisionMarketsFactory public decisionMarketsFactory;
  ERC20Gnosis public token;
  IScalarPriceOracleFactory public priceOracleFactory;
  LMSRMarketMaker public lmsrMarketMaker;
  uint24 public fee;
  uint public tradingPeriod;
  uint public timeToPriceResolution;
  uint public marketFundAmount;

  struct OutcomeTokenBalances {
    uint yesCollateral;
    uint noCollateral;
    uint yesShort;
    uint yesLong;
    uint noShort;
    uint noLong;
  }

  mapping(uint256 => DecisionLib.Decision) public decisions;
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
  * @param _decisionMarketsFactory creates IDecisionMarkets contract to run markets for decision
  * @param _priceOracleFactory oracle factory used to create oracles that resolve price after all trading is closed
  * @param _lmsrMarketMaker market maker library that calculates prediction market outomce token prices
  **/
  function initialize(
    uint24 _fee,
    uint _tradingPeriod,
    uint _timeToPriceResolution,
    uint _marketFundAmount,
    ERC20Gnosis _token,
    IDecisionMarketsFactory _decisionMarketsFactory,
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
    decisionMarketsFactory = _decisionMarketsFactory;
    priceOracleFactory = _priceOracleFactory;
    lmsrMarketMaker = _lmsrMarketMaker;
  }


  /**
  * @notice creates a new decision market related to `metadata`
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
    uint priceResolutionDate = startDate.add(timeToPriceResolution);

    IDecisionMarkets decisionMarkets = decisionMarketsFactory.createDecisionMarkets(
      msg.sender,
      ERC20Gnosis(token),
      Oracle(priceOracleFactory.createOracle(priceResolutionDate)),
      2,
      lowerBound,
      upperBound,
      lmsrMarketMaker,
      fee,
      tradingPeriod,
      startDate
    );

    decisions[decisionId].decisionMarkets = decisionMarkets;
    decisions[decisionId].startDate = startDate;
    decisions[decisionId].decisionResolutionDate = startDate.add(tradingPeriod);
    decisions[decisionId].priceResolutionDate = startDate.add(timeToPriceResolution);
    decisions[decisionId].lowerBound = lowerBound;
    decisions[decisionId].upperBound = upperBound;
    decisions[decisionId].metadata = metadata;
    decisions[decisionId].executionScript = executionScript;
    decisions[decisionId].decisionCreator = msg.sender;
    decisions[decisionId].token = token;

    require(token.transferFrom(msg.sender, this, marketFundAmount));
    require(token.approve(decisionMarkets, marketFundAmount));
    decisionMarkets.fund(marketFundAmount);

    emit StartDecision(decisionId, msg.sender, metadata, decisionMarkets, lowerBound, upperBound, startDate, decisions[decisionId].decisionResolutionDate, decisions[decisionId].priceResolutionDate);
  }

  function closeDecisionMarkets(uint decisionId) public {
    decisions[decisionId].closeDecisionMarkets();
  }

  function transitionDecision(uint decisionId) public {
    decisions[decisionId].transitionDecision();
  }

  /**
  * TODO: enable special permissions for executing decisions
  * @notice execute decision if final decision is ready and equals YES; otherwise Revert
  * @param decisionId decision unique identifier
  */
  function executeDecision(uint decisionId) public {
    decisions[decisionId].execute();

    bytes memory input = new bytes(0); // TODO: (aragon comment) Consider including input for decision scripts
    runScript(decisions[decisionId].executionScript, input, new address[](0));

    emit ExecuteDecision(decisionId);
  }

  // Workaround solution to get the contract address. Would be better to get from
  // Aragon client
  function contractAddress() public view returns (address) {
    return this;
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
    (yesCosts, noCosts) = decisions[decisionId].buyMarketPositions(collateralAmount, yesPurchaseAmounts, noPurchaseAmounts);

    _addToTraderDecisionBalances(
      decisionId,
      [
        collateralAmount.sub(yesCosts[0].add(yesCosts[1])),
        collateralAmount.sub(noCosts[0].add(noCosts[1]))
      ],
      yesPurchaseAmounts,
      noPurchaseAmounts
    );

    uint[4] memory marginalPrices = calcMarginalPrices(decisionId);

    emit BuyMarketPositions(msg.sender, decisionId, now, collateralAmount, yesPurchaseAmounts, noPurchaseAmounts, yesCosts, noCosts, marginalPrices);
  }

  /**
   * @notice sells all price prediction positions and adds rewarded collateral tokens to trader's
   *         yesCollateral and noCollateral balances
   * @param decisionId unique identifier for the decision
   */
  function sellMarketPositions(uint decisionId) {
    OutcomeTokenBalances storage outcomeTokenBalances = traderDecisionBalances[keccak256(msg.sender, decisionId)];

    int yesCollateralNetCost;
    int noCollateralNetCost;

    int[] memory yesSellPositions = new int[](2);
    int[] memory noSellPositions = new int[](2);

    (yesCollateralNetCost, noCollateralNetCost) = decisions[decisionId].sellMarketPositions(
      outcomeTokenBalances.yesLong,
      outcomeTokenBalances.yesShort,
      outcomeTokenBalances.noLong,
      outcomeTokenBalances.noShort
    );

    // translate int netCost into uint collateral received (netCost will be a negative number)
    uint yesCollateralReceived = uint(-yesCollateralNetCost);
    uint noCollateralReceived = uint(-noCollateralNetCost);

    // store sell positions to log in SellMarketPositions event, before they are set to 0
    yesSellPositions[0] = -int(outcomeTokenBalances.yesShort);
    yesSellPositions[1] = -int(outcomeTokenBalances.yesLong);
    noSellPositions[0] = -int(outcomeTokenBalances.noShort);
    noSellPositions[1] = -int(outcomeTokenBalances.noLong);

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

  /**
   * @notice allocates token back to the sender based on their balance of the winning outcome collateralToken
   * @param decisionId unique identifier for the decision
   */
  function redeemWinningCollateralTokens(uint decisionId) public {
    OutcomeTokenBalances storage outcomeTokenBalances = traderDecisionBalances[keccak256(msg.sender, decisionId)];

    (int winningIndex, uint winnings) = decisions[decisionId].transferWinningCollateralTokens(
      outcomeTokenBalances.yesCollateral,
      outcomeTokenBalances.noCollateral
    );

    if (winningIndex == 0) {
      outcomeTokenBalances.yesCollateral = 0;
    } else {
      outcomeTokenBalances.noCollateral = 0;
    }

    emit RedeemWinningCollateralTokens(msg.sender, decisionId, winningIndex, winnings);
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
        decisions[decisionId].decisionMarkets.getMarketByIndex(yesOrNo),
        i % 2
      );
    }
  }

  function redeemWinnings(uint decisionId) public {
    transitionDecision(decisionId);
    MarketData.Stages marketStage = decisions[decisionId].marketStage();
    require(marketStage != MarketData.Stages.MarketCreated);

    if (marketStage == MarketData.Stages.MarketFunded) {
      sellMarketPositions(decisionId);
    } else if (marketStage == MarketData.Stages.MarketClosed) {
      // redeem scalar winnings
      OutcomeTokenBalances storage balances = traderDecisionBalances[keccak256(msg.sender, decisionId)];

      (bool decisionPassed, uint winnings) = decisions[decisionId].redeemWinnings(
        balances.yesShort,
        balances.yesLong,
        balances.noShort,
        balances.noLong
      );

      if (decisionPassed) {
        balances.yesShort = 0;
        balances.yesLong = 0;
      } else {
        balances.noShort = 0;
        balances.noLong = 0;
      }

      emit RedeemScalarWinnings(decisionId, msg.sender, winnings);
    }

    redeemWinningCollateralTokens(decisionId);
  }

  /**
  * @notice gets net outcome tokens sold for one of a decision's markets
  * @param decisionId decision to get results for
  * @param marketIndex market to get net outcome tokens sold for
  * @return uint array with net outcome tokens sold
  */
  function getNetOutcomeTokensSoldForDecision(
    uint decisionId,
    uint marketIndex
  )
    public
    view
    returns(int[2] outcomeTokensSold)
  {
    outcomeTokensSold = decisions[decisionId].getNetOutcomeTokensSoldForDecision(marketIndex);
  }

  function _addToTraderDecisionBalances(
    uint decisionId,
    uint[2] collateralAmounts,
    uint[2] yesOutcomeAmounts,
    uint[2] noOutcomeAmounts
  ) internal {
    OutcomeTokenBalances storage balances = traderDecisionBalances[keccak256(msg.sender, decisionId)];
    balances.yesCollateral = balances.yesCollateral.add(collateralAmounts[0]);
    balances.noCollateral = balances.noCollateral.add(collateralAmounts[1]);
    balances.yesShort = balances.yesShort.add(yesOutcomeAmounts[0]);
    balances.yesLong = balances.yesLong.add(yesOutcomeAmounts[1]);
    balances.noShort = balances.noShort.add(noOutcomeAmounts[0]);
    balances.noLong = balances.noLong.add(noOutcomeAmounts[1]);
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
