pragma solidity ^0.4.24;

import "@gnosis.pm/pm-contracts/contracts/GnosisUtilContracts/Proxy.sol";
import './MedianPriceOracle.sol';
import './IScalarPriceOracleFactory.sol';

contract MedianPriceOracleFactoryData {

  event MedianPriceOracleCreation(address indexed creator, IScalarPriceOracle medianPriceOracle, uint resolutionDate);

  address public timeMedianDataFeed;
  uint public medianTimeframe;

}

contract MedianPriceOracleFactoryProxy is Proxy, MedianPriceOracleFactoryData {

  constructor(
    address proxied,
    address _timeMedianDataFeed,
    uint _medianTimeframe
  )
    Proxy(proxied)
    public
  {
    timeMedianDataFeed = _timeMedianDataFeed;
    medianTimeframe = _medianTimeframe;
  }

}

contract MedianPriceOracleFactory is Proxied, IScalarPriceOracleFactory, MedianPriceOracleFactoryData {

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
