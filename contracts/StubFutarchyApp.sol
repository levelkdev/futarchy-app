// this is just a stub for getting the UI working .. don't deploy it :D

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";

contract StubFutarchyApp is AragonApp {
    using SafeMath for uint256;
    
    /// Events
    event DecisionCreated(uint256 id, address creator);

    /// State
    Decision[] public decisions;
    uint256 public decisionCount;

    /// ACL
    bytes32 constant public CREATE_DECISIONS_ROLE = keccak256("CREATE_DECISIONS_ROLE");

    struct Decision {
        address creator;
    }

    function initialize()
        onlyInit
        public
    {
        initialized();
        decisions.push(Decision(0x0));
    }

    /**
     * @notice Create a new decision
     */
    function newDecision()
        auth(CREATE_DECISIONS_ROLE)
        external
    {
        decisionCount = decisionCount.add(1);
        decisions.push(Decision(msg.sender));
        emit DecisionCreated(decisionCount, msg.sender);
    }

}