//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address owner;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor (DappToken _dappToken, DaiToken _daiToken)public {
        daiToken = _daiToken;
        dappToken = _dappToken;
        owner = msg.sender;
    }

    //staking(deposit)
    function stakeTokens(uint _amount)public{
        require(_amount > 0 , "amount must be greater than zero");
        daiToken.transferFrom(msg.sender,address(this), _amount);
        stakingBalance[msg.sender] += _amount;
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
    //current status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }
    //unstake token(withdraw)
    function unstakeToken() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, "Balance must be greater than zero");
        daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }
    //reward tokens for the stakers
    function issueTokens() public{
        require(msg.sender == owner, "only owner can call this fucntion");
        for(uint i =0; i< stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
                dappToken.transfer(recipient, balance);
            }
        }
    }




}