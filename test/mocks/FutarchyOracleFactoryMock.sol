pragma solidity ^0.4.24;

import './FutarchyOracleMock.sol';

contract FutarchyOracleFactoryMock {

    function createFutarchyOracle(
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
        returns (FutarchyOracleMock futarchyOracle)
    {
        futarchyOracle = new FutarchyOracleMock(collateralToken);
    }
}
