import './Futarchy.sol';

contract FutarchySignalingApp is Futarchy {
  function transitionDecision(uint decisionId) public {
    // overwrite function with no funcionality
    // so it's ignored when called internally
  }

  function executeDecision() public {
    // revert since signaling markets do not
    // actually execute decision
    revert();
  }
}
