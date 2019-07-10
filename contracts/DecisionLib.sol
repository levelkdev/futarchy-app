pragma solidity ^0.4.24;

import './Oracles/CentralizedTimedOracle.sol'; /* TODO: switch to IScalarPriceOracle once we switch from centralized solution */
import '@gnosis.pm/pm-contracts/contracts/Oracles/FutarchyOracle.sol';
import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';

library DecisionLib {

  struct Decision {
    FutarchyOracle futarchyOracle;
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
    self.futarchyOracle.close();
    uint newBalance = self.token.balanceOf(this);

    uint creatorRefund = newBalance - previousBalance;
    require(self.token.transfer(self.decisionCreator, creatorRefund));

    winningMarketIndex = self.passed ? 0 : 1;
    self.futarchyOracle.markets(winningMarketIndex).eventContract().redeemWinnings();
    self.futarchyOracle.categoricalEvent().redeemWinnings();
  }

  function setDecision(Decision storage self) {
    require(self.decisionResolutionDate < now);

    if(!self.futarchyOracle.categoricalEvent().isOutcomeSet()) {
      if (!self.futarchyOracle.isOutcomeSet()) {
        self.futarchyOracle.setOutcome();
      }
      CategoricalEvent(self.futarchyOracle.categoricalEvent()).setOutcome();
    }

    self.resolved = true;
    self.passed = self.futarchyOracle.winningMarketIndex() == 0 ? true : false;
  }

  function execute(Decision storage self) {
    require(self.decisionResolutionDate < now && !self.executed);
    setDecision(self);
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
    CategoricalEvent categoricalEvent = self.futarchyOracle.categoricalEvent();
    StandardMarket yesMarket = self.futarchyOracle.markets(0);
    StandardMarket noMarket = self.futarchyOracle.markets(1);

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
    FutarchyOracle futarchyOracle = self.futarchyOracle;
    StandardMarket yesMarket = futarchyOracle.markets(0);
    StandardMarket noMarket = futarchyOracle.markets(1);

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

  function redeemWinningCollateralTokens(
    Decision storage self,
    uint yesCollateral,
    uint noCollateral
  ) returns (int winningIndex, uint winnings) {
    require(self.decisionResolutionDate < now);

    FutarchyOracle futarchyOracle = self.futarchyOracle;

    setDecision(self);
    winningIndex = futarchyOracle.getOutcome();
    futarchyOracle.categoricalEvent().redeemWinnings();

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

    ScalarEvent scalarEvent = ScalarEvent(self.futarchyOracle.markets(winningMarketIndex).eventContract());
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
    MarketData.Stages marketStage = self.futarchyOracle.markets(winningMarketIndex).stage();
    return marketStage;
  }

  function getNetOutcomeTokensSoldForDecision(
    Decision storage self,
    uint marketIndex
  ) returns (int[2] outcomeTokensSold) {
    // For markets, 0 is yes, and 1 is no; and for those markets' outcome tokens, 0 is short, and 1 long
    outcomeTokensSold[0] = self.futarchyOracle.markets(marketIndex).netOutcomeTokensSold(0);
    outcomeTokensSold[1] = self.futarchyOracle.markets(marketIndex).netOutcomeTokensSold(1);
  }

  function setPriceOutcome(
    Decision storage self,
    int price
  ) {
    CentralizedTimedOracle priceOracle = CentralizedTimedOracle(self.futarchyOracle.markets(0).eventContract().oracle());
    priceOracle.setOutcome(price);
  }

}
