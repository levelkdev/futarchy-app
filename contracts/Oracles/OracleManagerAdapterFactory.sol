pragma solidity ^0.4.24;

import './OracleManagerAdapter.sol';
import './IScalarPriceOracleFactory.sol';

contract OracleManageAdapterFactory is IScalarPriceOracleFactory {

    event OracleManagerAdapterCreation(address indexed creator, IScalarPriceOracle centralizedTimedOracle, bytes ipfsHash, uint resolutionDate);

    address timeMedianDataFeed;
    uint medianTimeframe;


    constructor(address _timeMedianDataFeed, uint _medianTimeframe) public {
      timeMedianDataFeed = _timeMedianDataFeed;
      medianTimeframe = _medianTimeframe;
    }

    /**
    * @dev Creates a new centralized & time-constrained oracle contract
    * @param ipfsHash Hash idxentifying off chain event description
    * @param resolutionDate starting date for which oracle can be resolved
    * @return Oracle contract
    */
    function createOracle(bytes ipfsHash, uint resolutionDate)
        external
        returns (IScalarPriceOracle oracleManagerAdapter)
    {
        oracleManagerAdapter = IScalarPriceOracle(
          new OracleManagerAdapter(timeMedianDataFeed, medianTimeframe, resolutionDate)
        );
        emit OracleManagerAdapterCreation(msg.sender, oracleManagerAdapter, ipfsHash, resolutionDate);
    }
}
