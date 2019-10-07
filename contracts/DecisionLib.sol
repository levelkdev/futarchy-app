pragma solidity ^0.4.24;

import './DecisionMarkets/IDecisionMarkets.sol';
import '@gnosis.pm/pm-contracts/contracts/Events/ScalarEvent.sol';
import '@gnosis.pm/pm-contracts/contracts/Markets/Market.sol';
import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';

library DecisionLib {

  struct Decision {
    IDecisionMarkets decisionMarkets;
    uint startDate;
    uint decisionResolutionDate;
    uint priceResolutionDate;
    int lowerBound;
    int upperBound;
    bool resolved;
    bool passed;
    bool executed;
    string metadata;
    bytes executionScript;
    address decisionCreator;
    ERC20Gnosis token;
  }

  function closeDecisionMarkets(Decision storage self) returns (uint winningMarketIndex) {
    uint previousBalance = self.token.balanceOf(this);
    self.decisionMarkets.close();
    uint newBalance = self.token.balanceOf(this);

    uint creatorRefund = newBalance - previousBalance;
    require(self.token.transfer(self.decisionCreator, creatorRefund));

    winningMarketIndex = uint(self.decisionMarkets.getOutcome());
    self.decisionMarkets.getMarketByIndex(winningMarketIndex).eventContract().redeemWinnings();
    self.decisionMarkets.getCategoricalEvent().redeemWinnings();
  }

  /**
  * @dev Checks to see if decision is ready for any transitions, then executes
  *      appropriate transitions to Event, Market, or Oracle contracts
  *      Guards against reverts by checking against assertions before executing any
  *      transitions. This function should NEVER revert
  */
  function transitionDecision(Decision storage self) public {
    if (self.decisionMarkets.outcomeCanBeSet()) {
      _closeResolvedDecision(self);
      _closeResolvedMarket(self);
    }
  }

  function _closeResolvedDecision(Decision storage self) private {
    // Resolve unresolved decision if enough time has passed
    if (self.decisionResolutionDate < now) {
      IDecisionMarkets decisionMarkets = self.decisionMarkets;

      if(!decisionMarkets.getCategoricalEvent().isOutcomeSet()) {
        if (!decisionMarkets.isOutcomeSet()) {
          decisionMarkets.setOutcome();
        }
        CategoricalEvent(decisionMarkets.getCategoricalEvent()).setOutcome();
      }

      // Update decision struct
      self.resolved = true;
      self.passed = decisionMarkets.getOutcome() == 0 ? true : false;
    }
  }

  function _closeResolvedMarket(Decision storage self) private {
    IDecisionMarkets decisionMarkets = self.decisionMarkets;
    Market winningMarket = decisionMarkets.getMarketByIndex(uint(decisionMarkets.getOutcome()));

    if (
      !(winningMarket.stage() == MarketData.Stages.MarketClosed) &&
      self.priceResolutionDate < now &&
      winningMarket.eventContract().oracle().isOutcomeSet()
    ) {
      if (!winningMarket.eventContract().isOutcomeSet()) {
        winningMarket.eventContract().setOutcome();
      }
      closeDecisionMarkets(self);
    }
  }

  function execute(Decision storage self) {
    require(self.decisionResolutionDate < now && !self.executed);
    transitionDecision(self);
    require(self.resolved && self.passed);
    self.executed = true;
  }

  function buyMarketPositions(
    Decision storage self,
    uint collateralAmount,
    uint[2] yesPurchaseAmounts,
    uint[2] noPurchaseAmounts
  ) returns (uint[2] yesCosts, uint[2] noCosts) {
    // set necessary contracts
    CategoricalEvent categoricalEvent = self.decisionMarkets.getCategoricalEvent();
    Market yesMarket = self.decisionMarkets.getMarketByIndex(0);
    Market noMarket = self.decisionMarkets.getMarketByIndex(1);

    require(self.token.transferFrom(msg.sender, this, collateralAmount));
    self.token.approve(categoricalEvent, collateralAmount);
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
  }

  function sellMarketPositions(
    Decision storage self,
    uint yesLongAmount,
    uint yesShortAmount,
    uint noLongAmount,
    uint noShortAmount
  ) returns (
    int yesCollateralNetCost,
    int noCollateralNetCost
  ) {
    int[] memory yesSellAmounts = new int[](2);
    int[] memory noSellAmounts = new int[](2);

    // set necessary contracts
    IDecisionMarkets decisionMarkets = self.decisionMarkets;
    Market yesMarket = decisionMarkets.getMarketByIndex(0);
    Market noMarket = decisionMarkets.getMarketByIndex(1);

    // approve token transfers
    yesMarket.eventContract().outcomeTokens(1).approve(yesMarket, yesLongAmount);
    yesMarket.eventContract().outcomeTokens(0).approve(yesMarket, yesShortAmount);
    noMarket.eventContract().outcomeTokens(1).approve(noMarket, noLongAmount);
    noMarket.eventContract().outcomeTokens(0).approve(noMarket, noShortAmount);

    yesSellAmounts[0] = -int(yesShortAmount);
    yesSellAmounts[1] = -int(yesLongAmount);
    noSellAmounts[0] = -int(noShortAmount);
    noSellAmounts[1] = -int(noLongAmount);

    // sell positions (market.trade() with negative numbers to perform a sell)
    yesCollateralNetCost = yesMarket.trade(yesSellAmounts, 0);
    noCollateralNetCost  = noMarket.trade(noSellAmounts, 0);
  }

  function transferWinningCollateralTokens(
    Decision storage self,
    uint yesCollateral,
    uint noCollateral
  ) returns (int winningIndex, uint winnings) {
    require(self.decisionResolutionDate < now);

    IDecisionMarkets decisionMarkets = self.decisionMarkets;

    winningIndex = decisionMarkets.getOutcome();
    decisionMarkets.getCategoricalEvent().redeemWinnings();

    if (winningIndex == 0) {
      winnings = yesCollateral;
    } else {
      winnings = noCollateral;
    }

    require(self.token.transfer(msg.sender, winnings));
  }

  function redeemWinnings(
    Decision storage self,
    uint yesShortAmount,
    uint yesLongAmount,
    uint noShortAmount,
    uint noLongAmount
  ) returns (bool decisionPassed, uint winnings) {
    decisionPassed = self.passed;
    uint winningMarketIndex = decisionPassed ? 0 : 1;

    ScalarEvent scalarEvent = ScalarEvent(self.decisionMarkets.getMarketByIndex(winningMarketIndex).eventContract());
    scalarEvent.redeemWinnings();

    uint shortOutcomeTokenCount;
    uint longOutcomeTokenCount;
    if (decisionPassed) {
      shortOutcomeTokenCount = yesShortAmount;
      longOutcomeTokenCount = yesLongAmount;
    } else {
      shortOutcomeTokenCount = noShortAmount;
      longOutcomeTokenCount = noLongAmount;
    }

    winnings = scalarEvent.calculateWinnings(shortOutcomeTokenCount, longOutcomeTokenCount);
    require(self.token.transfer(msg.sender, winnings));
  }

  function marketStage(Decision storage self) returns (MarketData.Stages) {
    uint winningMarketIndex = self.passed ? 0 : 1;
    MarketData.Stages marketStage = self.decisionMarkets.getMarketByIndex(winningMarketIndex).stage();
    return marketStage;
  }

  function getNetOutcomeTokensSoldForDecision(
    Decision storage self,
    uint marketIndex
  ) returns (int[2] outcomeTokensSold) {
    // For markets, 0 is yes, and 1 is no; and for those markets' outcome tokens, 0 is short, and 1 long
    outcomeTokensSold[0] = self.decisionMarkets.getMarketByIndex(marketIndex).netOutcomeTokensSold(0);
    outcomeTokensSold[1] = self.decisionMarkets.getMarketByIndex(marketIndex).netOutcomeTokensSold(1);
  }
}
