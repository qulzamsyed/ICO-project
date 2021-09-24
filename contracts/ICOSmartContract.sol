// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./myERC20.sol";
contract ICOTokenInvestment {
    using SafeMath for uint256;
    address owner;
    address contractAddress;
    QToken QT = new QToken("QToken","QT",10000000);
     uint256 public saleTime;
     struct invester{
        address id;
        string name;
        uint256 tokenAmount;
    }
    mapping(uint256=>invester)investers;
    uint256 public crowdSaleGoal = 100000;
    uint256 public count = 0;
    uint256 public totalInvestment = 0;
    mapping(address=>uint256) public investedTokenAmount;
    mapping(uint256=>address)public investerIds;
    mapping(address=>bool) public isHaveAccount;
    //string public name = QT.getName();
    constructor() {
        owner = msg.sender;
     contractAddress = address(this);
     saleTime = block.timestamp + 30 days;
    QT.approve(contractAddress,owner,QT.balanceOf(contractAddress));
    }
    modifier onlyContractOwner() {
    require(msg.sender == owner,"This function is restricted to the contract's owner");
    _;
  }
    modifier haveAccount() {
      require(isHaveAccount[msg.sender]==true,"You don not have account");
      _;
  }
    function isHaveInvestmentAccount() public view returns(bool){
        
    }
     function mintToken(address _addr) public {
        QT.mint(_addr,10000);

    }
    function getBalance(address _addr) public view returns(uint256){
        return QT.balanceOf(_addr);
    } 
    function getContractAddress() public view returns(address){
        return contractAddress;
    }
     function getInvestedTokensById(uint256 _id) public view returns(uint256){
        return investedTokenAmount[investerIds[_id]];
    }
    function getNameOfAccountMemberById(uint256 _id) public view returns(string memory){
        return investers[_id].name;
    }
    function makeInvesterAccount(string memory _name,uint256 _initialInvestTokens) public{
        require(_initialInvestTokens>0,"You must invest as minimum as 1 token");
        require(_initialInvestTokens<=QT.balanceOf(msg.sender),"you dont have such amount");
        investers[count] = invester(msg.sender,_name,_initialInvestTokens);
        investerIds[count] = msg.sender;
        investedTokenAmount[msg.sender]+=_initialInvestTokens;
        totalInvestment+=_initialInvestTokens;
        isHaveAccount[msg.sender] = true;
        QT.approve(msg.sender, contractAddress, _initialInvestTokens);
        QT.transferFrom(msg.sender,contractAddress,_initialInvestTokens);
        count++;
    }
    function investTokens(uint256 _tokenAmount) public haveAccount{
        require(_tokenAmount>0,"You must invest as minimum as 1 token");
        require(_tokenAmount<=QT.balanceOf(msg.sender),"you dont have such amount");
         QT.approve(msg.sender, contractAddress, _tokenAmount);
        QT.transferFrom(msg.sender,contractAddress,_tokenAmount);
        investedTokenAmount[msg.sender]+=_tokenAmount;
        totalInvestment+=_tokenAmount;
    }
    function getTotalInvestment() public view returns(uint256){
        return totalInvestment;
    }
    function getCrowdSaleGoal() public view returns(uint256){
        return crowdSaleGoal;
    }
    function crowdSale() public onlyContractOwner{
        require(totalInvestment>=crowdSaleGoal.div(2),"Goal limit is not reached");
        require(block.timestamp>=saleTime,"Sale time is not start");
        for(uint256 i=0;i<=count;i++){
             QT.mint(contractAddress,investedTokenAmount[investerIds[i]].mul(10).div(100));
             investedTokenAmount[investerIds[i]]+=investedTokenAmount[investerIds[i]].mul(10).div(100);
             QT.transfer(investerIds[i], investedTokenAmount[investerIds[i]]);
             investedTokenAmount[investerIds[i]] = 0;
        }
        totalInvestment=0;
    }
    
    function withDrawTokens(uint256 _withDrawAmount) public haveAccount{
        require(block.timestamp>=saleTime || totalInvestment>=crowdSaleGoal.div(2),"should be either goal is reached or time is reached");
        require(_withDrawAmount<=investedTokenAmount[msg.sender],"You don not have such amount");
        if(msg.sender==investerIds[0])
        {
            investedTokenAmount[investerIds[0]]+=investedTokenAmount[investerIds[0]].mul(20).div(100);
            QT.mint(contractAddress,investedTokenAmount[investerIds[0]].mul(20).div(100));
            
        }
        else if(msg.sender==investerIds[1])
        {
            investedTokenAmount[investerIds[1]]+=investedTokenAmount[investerIds[1]].mul(20).div(100);
            QT.mint(contractAddress,investedTokenAmount[investerIds[1]].mul(20).div(100));
        }
        investedTokenAmount[msg.sender]-=(_withDrawAmount);
        totalInvestment-=(_withDrawAmount);
        QT.approve(contractAddress,contractAddress,_withDrawAmount);
        QT.transferFrom(contractAddress,msg.sender,_withDrawAmount);
        if(QT.balanceOf(msg.sender)==0){
            isHaveAccount[msg.sender]==false;
        }
    }
   
}