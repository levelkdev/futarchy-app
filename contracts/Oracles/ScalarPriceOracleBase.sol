pragma solidity ^0.4.24;

contract ScalarPriceOracleBase {

  event OutcomeAssignment(int outcome);

  bool public isSet;
  int public outcome;

  /**
  * @dev returns whether outcome is set
  * @return true if outcome is set, false if outcome is not set
  */
  function isOutcomeSet() public view returns (bool) {
    return isSet;
  }

  /**
  * @dev returns the value of the outcome
  * @return value of set outcome
  */
  function getOutcome() public view returns (int) {
    return outcome;
  }

  function _setOutcome(int _outcome) internal {
    require(!isSet, "oracle is already set");
    isSet = true;
    outcome = _outcome;
    emit OutcomeAssignment(outcome);
  }
}
