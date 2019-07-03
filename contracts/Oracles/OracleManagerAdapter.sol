pragma solidity ^0.4.24;

import './IScalarPriceOracle.sol';
import './TimedOracle.sol';

/**
* Contract that allows IScalarPriceOracle to interface with
* Aragon's Oracle Manager App which uses tidbit oracle interface
*/
contract OracleManagerAdapter is IScalarPriceOracle, TimedOracle {

  address public oracleManagerApp;
  int public outcome;
  bool public isSet;

  constructor(
    address _oracleManagerApp,
    uint _resolutionDate
  ) public TimedOracle(_resolutionDate)
  {
    oracleManagerApp = _oracleManagerApp;
  }

  function setOutcome(int _outcome) public resolutionDatePassed {
    // this function will pull the outcome from another contract rather than
    // function parameters
    require(_outcome == 0);
    uint result;
    /* TODO: result = oracleManager.getMedianPrice(resolutionDate, 24 hours) */
    super.setOutcome(int(result));
  }
}
