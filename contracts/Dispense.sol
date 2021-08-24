import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract Dispense {
  using SafeERC20 for IERC20;

  IERC20 token;
  address public keeper;
  address public owner; 
  mapping(address=>uint8) hypervisors;

  event Dispense(address indexed hypervisor, uint256 amount);
  event OwnershipTransferred(address indexed owner);
  event KeeperTransferred(address indexed keeper);
  event HypervisorSet(address indexed hypervisor, uint8 state);

  constructor(
    address _token,
    address _keeper,
    address _owner,
    address[] memory _hypervisors
  ) {
    token = IERC20(_token);
    keeper  = _keeper;
    owner = _owner; 

    for(uint8 i = 0; i < _hypervisors.length; i++) {
      hypervisors[_hypervisors[i]] = 1;
      emit HypervisorSet(_hypervisors[i], 1);
    }
  }

  function dispense(address hypervisor, uint256 amount) external {
    require(msg.sender == keeper, "Keeper only");
    require(hypervisors[hypervisor] == 1, "Hypervisor not approved");
    token.safeTransfer(hypervisor, amount);
    emit Dispense(hypervisor, amount);
  }

  function setHypervisor(address hypervisor, uint8 state) external {
    require(msg.sender == owner, "Owner only");
    hypervisors[hypervisor] = state;
    emit HypervisorSet(hypervisor, state);
  }

  function transferOwnership(address newOwner) external {
    require(msg.sender == owner, "Owner only");
    owner = newOwner;
  }

  function transferKeeper(address newKeeper) external {
      require(msg.sender == keeper || msg.sender == owner, "Owner or keeper only");
      keeper = newKeeper;
  }

}
