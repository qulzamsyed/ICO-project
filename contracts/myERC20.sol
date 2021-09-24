// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
interface IQToken{
    function getName() external view returns(string memory);
    function getSymbol() external view returns(string memory);
    function getTotalSupply() external view returns(uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient,uint256 amount) external;
    function transferFrom(address sender,address recipient,uint256 amount ) external returns (bool);
    function approve(address _owner,address _spender,uint256 _amount) external;
    function allowance(address _owner, address _spender) external view returns (uint256);
    function mint(address account, uint256 amount)  external ;
    function burn(address account, uint256 amount)  external ;
}
contract QToken {
    using SafeMath for uint256;
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) private allowances;
    uint256 private totalSupply;
    string private name;
    string private symbol;
    address public owner;
    constructor (string memory _name, string memory _symbol,uint256 _totalSupply){
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        owner = msg.sender;
    }
    modifier onlyContractOwner() {
    require(msg.sender == owner,"This function is restricted to the contract's owner");
    _;
  }
    function getName() external view returns(string memory) {
        return name;
    }
    function getSymbol() external view returns(string memory) {
        return symbol;
    }
    function getTotalSupply() external view returns(uint256) {
        return totalSupply;
    }
     function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
    function transfer(address recipient,uint256 amount) external{
            require(balances[msg.sender] >= amount, "you do not have much amount");
            balances[msg.sender] = balances[msg.sender].sub(amount);
            balances[recipient] = balances[recipient].add(amount);
    }
    function transferFrom(address sender,address recipient,uint256 amount ) external returns (bool) {
            require(balances[sender] >= amount, "transfer amount exceeds balance");
            require(allowances[sender][msg.sender] >= amount, "transfer amount exceeds allowance");
            balances[sender] = balances[sender].sub(amount);
            balances[recipient] += amount;
            allowances[sender][msg.sender] = allowances[sender][msg.sender].sub(amount);
        return true;
    }
      function approve(address _owner,address _spender,uint256 _amount) external {
        allowances[_owner][_spender] = _amount;
    }
    function allowance(address _owner, address _spender) external view returns (uint256) {
        return allowances[_owner][_spender];
    }
    function mint(address account, uint256 amount)  external onlyContractOwner{

        totalSupply = totalSupply.add(amount);
        balances[account] = balances[account].add(amount);
    }
    function burn(address account, uint256 amount)  external onlyContractOwner{

        require(balances[account] >= amount, "burn amount exceeds balance");
            balances[account] = balances[account].sub(amount);
            totalSupply = totalSupply.sub(amount);
    }


}