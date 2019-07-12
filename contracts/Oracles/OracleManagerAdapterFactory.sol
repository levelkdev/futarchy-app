pragma solidity ^0.4.24;

import './OracleManageAdapter.sol';
import './IScalarPriceOracleFactory.sol';

contract OracleManageAdapterFactory is IScalarPriceOracleFactory {

    event OracleManageAdapterCreation(address indexed creator, IScalarPriceOracle centralizedTimedOracle, bytes ipfsHash, uint resolutionDate);

    MedianDataFeedOracle medianDataFeed;
    uint medianTimeframe


    constructor(address _medianDataFeed, uint _medianTimeframe) public {
      medianDataFeed = _medianDataFeed;
      medianTimeFrame = _medianTimeframe;
    }

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
