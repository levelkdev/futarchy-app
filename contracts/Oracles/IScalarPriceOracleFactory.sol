pragma solidity ^0.4.24;

import './IScalarPriceOracle.sol';

interface IScalarPriceOracleFactory {
  function createOracle(bytes ipfsHash, uint resolutionDate) external returns (IScalarPriceOracle);
}
