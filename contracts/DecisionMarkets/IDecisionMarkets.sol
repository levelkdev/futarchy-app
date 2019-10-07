pragma solidity ^0.4.24;

import '@gnosis.pm/pm-contracts/contracts/Markets/Market.sol';
import '@gnosis.pm/pm-contracts/contracts/Events/CategoricalEvent.sol';

contract IDecisionMarkets {
  function fund(uint funding) public;
  function close() public;
  function setOutcome() public;
  function getMarketByIndex(uint) public view returns (Market);
  function getCategoricalEvent() public view returns (CategoricalEvent);
  function isOutcomeSet() public view returns (bool);
  function outcomeCanBeSet() public view returns (bool);
  function getOutcome() public view returns (int);
}
