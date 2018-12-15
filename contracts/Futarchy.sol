pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";
import '@gnosis.pm/pm-contracts/contracts/Oracles/FutarchyOracleFactory.sol';
import '@gnosis.pm/pm-contracts/contracts/MarketMakers/LMSRMarketMaker.sol';
import '@gnosis.pm/pm-contracts/contracts/Oracles/Oracle.sol';
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import '@gnosis.pm/pm-contracts/contracts/Tokens/ERC20Gnosis.sol';

contract Futarchy is AragonApp {

  bytes32 public constant CREATE_DECISION_ROLE = keccak256("CREATE_DECISION_ROLE");

  event StartDecision(uint indexed decisionId, address indexed creator, string metadata, FutarchyOracle futarchyOracle);
  event ExecuteDecision(uint decisionId);

  FutarchyOracleFactory public futarchyOracleFactory;
  MiniMeToken public token;
  Oracle public priceResolutionOracle;
  LMSRMarketMaker public lmsrMarketMaker;
  uint24 public fee;
  uint public tradingPeriod;

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

    /**
    * @notice initialize Futarchy app with state
    * @param _fee Percent trading fee prediction markets will collect
    * @param _tradingPeriod trading period before decision can be determined
    * @param _token token used to participate in prediction markets
    * @param _futarchyOracleFactory creates FutarchyOracle to begin new decision
    *         https://github.com/gnosis/pm-contracts/blob/v1.0.0/contracts/Oracles/FutarchyOracleFactory.sol
    * @param _priceResolutionOracle oracle used to resolve price after all trading is closed
    * @param _lmsrMarketMaker market maker library that calculates prediction market outomce token prices
    * FutarchyOracleFactory comes from Gnosis https://github.com/gnosis/pm-contracts/blob/v1.0.0/contracts/Oracles/FutarchyOracleFactory.sol
    * TODO: BoundsOracle - Calculates the upper and lower bounds for creating a new FutarchyOracle
    * TODO: PriceFeedOracle - Is used to resolve all futarchy decision markets
    **/
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


    /**
    * @notice creates a new futarchy decision market related to `metadata`
    * @param executionScript EVM script to be executed on approval
    * @param metadata Decision metadata
    **/
    function newDecision(
      bytes executionScript,
      string metadata
    ) external returns (uint decisionId) {
      int lowerBound;
      int upperBound;
      decisionId = decisionLength++;
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

      emit StartDecision(decisionId, msg.sender, metadata, decisions[decisionId].futarchyOracle);
    }

    /**
    * @notice returns Decision struct data
    * @param decisionId decision unique identifier
    **/
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

    /* TODO: actually get real bounds */
    function _calculateBounds() internal returns(int lowerBound, int upperBound) {
      lowerBound = 0;
      upperBound = 100;
    }

    /* IForwarder API */
    function isForwarder() external pure returns (bool) {
      return true;
    }

    function forward(bytes evmCallScript) public {
      // require(canForward(msg.sender, evmCallScript));
      // _newDecision();
    }

    function canForward(address _sender, bytes evmCallScript) public returns (bool) {
      // return canPerform(_sender, CREATE_DECISION_ROLE, arr());
    }
}
