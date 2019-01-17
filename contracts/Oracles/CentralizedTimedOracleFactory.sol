pragma solidity ^0.4.24;

import './CentralizedTimedOracle.sol';
import './IScalarPriceOracleFactory.sol';


contract CentralizedTimedOracleFactory is IScalarPriceOracleFactory {

    event CentralizedTimedOracleCreation(address indexed creator, IScalarPriceOracle centralizedTimedOracle, bytes ipfsHash, uint resolutionDate);

    /**
    * @dev Creates a new centralized & time-constrained oracle contract
    * @param ipfsHash Hash idxentifying off chain event description
    * @return Oracle contract
    */
    function createOracle(bytes ipfsHash, uint resolutionDate)
        external
        returns (IScalarPriceOracle centralizedTimedOracle)
    {
        centralizedTimedOracle = IScalarPriceOracle(new CentralizedTimedOracle(msg.sender, ipfsHash, resolutionDate));
        emit CentralizedTimedOracleCreation(msg.sender, centralizedTimedOracle, ipfsHash, resolutionDate);
    }
}
