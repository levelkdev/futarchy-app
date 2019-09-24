pragma solidity ^0.4.24;

import './MedianPriceOracle.sol';
import './IScalarPriceOracleFactory.sol';

contract MedianPriceOracleFactory is IScalarPriceOracleFactory {

    event MedianPriceOracleCreation(address indexed creator, IScalarPriceOracle medianPriceOracle, uint resolutionDate);

    address public timeMedianDataFeed;
    uint public medianTimeframe;

    constructor(address _timeMedianDataFeed, uint _medianTimeframe) public {
      timeMedianDataFeed = _timeMedianDataFeed;
      medianTimeframe = _medianTimeframe;
    }

    /**
    * @dev Creates a new median price oracle contract
    * @param resolutionDate starting date for which oracle can be resolved
    * @return Oracle contract
    */
    function createOracle(uint resolutionDate)
        external
        returns (IScalarPriceOracle medianPriceOracle)
    {
        medianPriceOracle = IScalarPriceOracle(
          new MedianPriceOracle(timeMedianDataFeed, medianTimeframe, resolutionDate)
        );
        emit MedianPriceOracleCreation(msg.sender, medianPriceOracle, resolutionDate);
    }
}
