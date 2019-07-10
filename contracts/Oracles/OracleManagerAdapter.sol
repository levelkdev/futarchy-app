pragma solidity ^0.4.24;

import './ScalarPriceOracleBase.sol';
import './TimedOracle.sol';

/**
* Contract that allows IScalarPriceOracle to interface with
* Aragon's Oracle Manager App which uses tidbit oracle interface
*/
contract OracleManagerAdapter is ScalarPriceOracleBase, TimedOracle {

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

  /**
  * @dev consults tidbit dataFeed to calculate and set outcome
  */
  function setOutcome() public resolutionDatePassed {
    uint result;
    /* TODO: result = oracleManager.getMedianPrice(resolutionDate, 24 hours) */
    _setOutcome(int(result));
  }
}
