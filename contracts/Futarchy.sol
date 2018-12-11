pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";
import '@gnosis.pm/pm-contracts/contracts/Oracles/FutarchyOracleFactory.sol';
import '@gnosis.pm/pm-contracts/contracts/MarketMakers/LMSRMarketMaker.sol';
import '@gnosis.pm/pm-contracts/contracts/Oracles/Oracle.sol';
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';

contract Futarchy is AragonApp {

  event StartDecision(uint indexed decisionId, address indexed creator, string metadata);
  event ExecuteDecision(uint decisionId);

  FutarchyOracleFactory public futarchyOracleFactory;
  MiniMeToken public token;
  Oracle priceResolutionOracle;
  LMSRMarketMaker lmsrMarketMaker;
  uint24 fee;
  uint tradingPeriod;

  struct Decision {
    FutarchyOracle futarchyOracle;
    uint64 startDate;
    uint64 snapshotBlock;
    bool executed;
    string metadata;
    bytes executionScript;
  }

  mapping(uint256 => Decision) public decisions;
  uint public decisionLength;

  modifier decisionExists(uint256 _decisionId) {
      require(_decisionId < decisionLength);
      _;
  }

    /* FutarchyOracleFactory comes from Gnosis https://github.com/gnosis/pm-contracts/blob/v1.0.0/contracts/Oracles/FutarchyOracleFactory.sol */
    /* TODO: BoundsOracle - Calculates the upper and lower bounds for creating a new FutarchyOracle */
    /* TODO: PriceFeedOracle - Is used to resolve all futarchy decision markets */
    function initialize(
      uint24 _fee,
      uint _tradingPeriod,
      MiniMeToken _token,
      FutarchyOracleFactory _futarchyOracleFactory,
      Oracle _priceResolutionOracle,
      LMSRMarketMaker _lmsrMarketMaker
    )
      onlyInit
      public
    {
      initialized();
      fee = _fee;
      tradingPeriod = _tradingPeriod;
      token = _token;
      futarchyOracleFactory = _futarchyOracleFactory;
      priceResolutionOracle = _priceResolutionOracle;
      lmsrMarketMaker = _lmsrMarketMaker;
    }

    function newDecision(
      bytes executionScript,
      string metadata
    ) external returns (uint decision) {
      int lowerBound;
      int upperBound;
      uint decisionId = decisionLength++;
      decisions[decisionId].startDate = getTimestamp64();
      decisions[decisionId].metadata = metadata;
      decisions[decisionId].snapshotBlock = getBlockNumber64() - 1;
      decisions[decisionId].executionScript = executionScript;
      (lowerBound, upperBound) = _calculateBounds();

      decisions[decisionId].futarchyOracle = futarchyOracleFactory.createFutarchyOracle(
        ERC20Gnosis(token),
        priceResolutionOracle,
        2,
        lowerBound,
        upperBound,
        lmsrMarketMaker,
        fee,
        tradingPeriod,
        decisions[decisionId].startDate
      );

      emit StartDecision(decisionId, msg.sender, metadata);
    }

    function getDecision(uint decisionId)
      public
      view
      decisionExists(decisionId)
      returns (
        bool open,
        bool executed,
        uint64 startDate,
        uint64 snapshotBlock,
        uint256 marketPower,
        bytes script

        )
    {
      Decision storage decision = decisions[decisionId];
      open = !decision.futarchyOracle.isOutcomeSet();
      executed = decision.executed;
      startDate = decision.startDate;
      snapshotBlock = decision.snapshotBlock;
      marketPower = token.totalSupplyAt(decision.snapshotBlock);
      script = decision.executionScript;
    }

    /* TODO: enable special permissions for executing decisions */
    function executeDecision(uint decisionId) public {
      Decision storage decision = decisions[decisionId];

      decision.executed = true;

      bytes memory input = new bytes(0); // TODO: Consider including input for decision scripts
      runScript(decision.executionScript, input, new address[](0));

      emit ExecuteDecision(decisionId);
    }

    function _isDecisionOpen(Decision storage decision) internal returns (bool) {
      return decision.futarchyOracle.isOutcomeSet();
    }

    function _calculateBounds() internal returns(int lowerBound, int upperBound) {
      lowerBound = 0;
      upperBound = 100;
    }

    /* // IForwarder API
    function isForwarder() external pure returns (bool) {
      return true;
    }

    function canForward(address sender, bytes evmCallScript) public returns (bool) {
      return canPerform(_sender, CREATE_VOTES_ROLE, arr());
    }

    function forward(bytes evmCallScript) public {
      require(canForward(msg.sender, evmCallScript);
      _newDecision()
    } */

}
