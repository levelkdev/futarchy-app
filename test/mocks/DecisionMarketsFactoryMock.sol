pragma solidity ^0.4.24;

import './DecisionMarketsMock.sol';

contract DecisionMarketsFactoryMock {

    function createDecisionMarkets(
        address decisionCreator,
        address collateralToken,
        address oracle,
        uint8 outcomeCount,
        int lowerBound,
        int upperBound,
        address marketMaker,
        uint24 fee,
        uint tradingPeriod,
        uint startDate
    )
        public
        returns (DecisionMarketsMock decisionMarkets)
    {
        decisionMarkets = new DecisionMarketsMock(collateralToken);
    }
}
