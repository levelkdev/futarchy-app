pragma solidity ^0.4.24;

import './FutarchyDecisionMarketsMock.sol';

contract FutarchyDecisionMarketsFactoryMock {

    function createDecisionMarkets(
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
        returns (FutarchyDecisionMarketsMock futarchyDecisionMarkets)
    {
        futarchyDecisionMarkets = new FutarchyDecisionMarketsMock(collateralToken);
    }
}
