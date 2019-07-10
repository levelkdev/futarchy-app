pragma solidity ^0.4.24;

contract ScalarPriceOracleBase {

  event OutcomeAssignment(int outcome);

  bool public isSet;
  int public outcome;

  function isOutcomeSet() public view returns (bool) {
    return isSet;
  }

  function getOutcome() public view returns (int) {
    return outcome;
  }

  function _setOutcome(int _outcome) internal {
    require(!isSet);
    isSet = true;
    outcome = _outcome;
    emit OutcomeAssignment(outcome);
  }
}
