pragma solidity ^0.4.24;

import './CentralizedTimedOracle.sol';
import './IScalarPriceOracleFactory.sol';


contract CentralizedTimedOracleFactory is IScalarPriceOracleFactory {

    event CentralizedTimedOracleCreation(address indexed creator, IScalarPriceOracle centralizedTimedOracle, uint resolutionDate);

    address public owner;

    constructor(address _owner) public {
      owner = _owner;
    }

    /**
    * @dev Creates a new centralized & time-constrained oracle contract
    * @param resolutionDate date that price oracle can be resolved
    * @return Oracle contract
    */
    function createOracle(uint resolutionDate)
        external
        returns (IScalarPriceOracle centralizedTimedOracle)
    {
        centralizedTimedOracle = IScalarPriceOracle(new CentralizedTimedOracle(owner, resolutionDate));
        emit CentralizedTimedOracleCreation(msg.sender, centralizedTimedOracle, resolutionDate);
    }
}
