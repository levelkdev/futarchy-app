pragma solidity ^0.4.24;

import './CentralizedTimedOracle.sol';
import './IScalarPriceOracleFactory.sol';


contract CentralizedTimedOracleFactory is IScalarPriceOracleFactory {

    event CentralizedTimedOracleCreation(address indexed creator, IScalarPriceOracle centralizedTimedOracle, uint resolutionDate);

    /**
    * @dev Creates a new centralized & time-constrained oracle contract
    * @param resolutionDate date that price oracle can be resolved
    * @return Oracle contract
    */
    function createOracle(uint resolutionDate)
        external
        returns (IScalarPriceOracle centralizedTimedOracle)
    {
        centralizedTimedOracle = IScalarPriceOracle(new CentralizedTimedOracle(msg.sender, resolutionDate));
        emit CentralizedTimedOracleCreation(msg.sender, centralizedTimedOracle, resolutionDate);
    }
}
