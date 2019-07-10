pragma solidity ^0.4.24;

interface IScalarPriceOracle {
  function isOutcomeSet() public view returns (bool);
  function getOutcome() public view returns (int);
}
