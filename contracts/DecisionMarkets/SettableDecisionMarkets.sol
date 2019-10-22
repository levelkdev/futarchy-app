pragma solidity ^0.4.24;

import "./IDecisionMarkets.sol";
import "./DecisionMarketsBase.sol";
import "@gnosis.pm/pm-contracts/contracts/Oracles/Oracle.sol";
import "@gnosis.pm/pm-contracts/contracts/Events/EventFactory.sol";
import "@gnosis.pm/pm-contracts/contracts/Markets/StandardMarketWithPriceLoggerFactory.sol";
import "@gnosis.pm/pm-contracts/contracts/GnosisUtilContracts/Proxy.sol";

contract SettableDecisionMarketsData {

  event ExternalOutcomeSet(uint outcome);

  uint public externalOutcome;
  bool public externalOutcomeIsSet;
}

contract SettableDecisionMarkets is IDecisionMarkets, Proxied, DecisionMarketsBase, SettableDecisionMarketsData {

  /// @dev Allows decisionCreator to store a winning outcome, which will be assigned when
  ///      setOutcome() is called. This pattern is used so that this contract implements
  ///      IDecisionMarkets and remains compatible with Futarchy.sol
  function setExternalOutcome(uint _externalOutcome)
    isDecisionCreator
    public
  {
    require(_externalOutcome <= 1);
    require(!isSet);
    externalOutcome = _externalOutcome;
    externalOutcomeIsSet = true;
    emit ExternalOutcomeSet(externalOutcome);
  }

  /// @dev Assign winning outcome based on external outcome set by owner
  function setOutcome()
    public
  {
    require(externalOutcomeIsSet);
    require(!isSet);
    winningMarketIndex = externalOutcome;
    isSet = true;
    emit OutcomeAssignment(winningMarketIndex);
  }

  /// @return True if external outcome has been set
  function outcomeCanBeSet()
    public
    view
    returns (bool)
  {
    return externalOutcomeIsSet;
  }
}
