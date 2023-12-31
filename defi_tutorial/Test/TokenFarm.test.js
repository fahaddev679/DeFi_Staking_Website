const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
.use(require("chai-as-promised"))
.should();

function tokens(n){
    return web3.utils.toWei(n, 'ether');
}

contract("TokenFarm", ([owner, investor])=>{
    let daiToken, dappToken, tokenFarm;

    before(async()=>{
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        await dappToken.transfer(tokenFarm.address, tokens('1000000'));
        await daiToken.transfer(investor, tokens('100'), {from: owner});
    })

    describe('Mock DAI deployment', async()=>{
        it('has a name', async()=> {
            const name = await daiToken.name();
            assert.equal(name, "Mock DAI Token");
        })
    })

    describe('Dapp Token deployment', async()=>{
        it('has a name', async()=> {
            const name = await dappToken.name();
            assert.equal(name, "DApp Token");
        })
    })

    describe('Token Farm deployment', async()=>{
        it('has a name', async()=> {
            const name = await tokenFarm.name();
            assert.equal(name, "Dapp Token Farm");
        })

        it('contract has tokens', async()=>{
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('1000000'));
        })
    })

    describe('Farming Tokens', async()=>{

        it('rewards investor for staking tokens', async()=>{
            let result;
        //check balance before staking
        result = await daiToken.balanceOf(investor);
        assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking');
            //here we will stake
        await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor});
        await tokenFarm.stakeTokens(tokens('100'), {from: investor});
            //check balance after staking
        result = await daiToken.balanceOf(investor);
        assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking');

        result = await daiToken.balanceOf(tokenFarm.address);
        assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking');

        result = await tokenFarm.stakingBalance(investor);
        assert.equal(result.toString(), tokens('100'), 'please correct investor staking balance after staking');

        result = await tokenFarm.isStaking(investor);
        assert.equal(result.toString(), 'true', 'please correct investor staking status after stake');

        await tokenFarm.issueTokens({from: owner});
        result = await dappToken.balanceOf(investor);
        assert.equal(result.toString(), tokens('100'), 'please correct investor dapp token balance after staking');
        await tokenFarm.issueTokens({from: investor}).should.be.rejected;

        await tokenFarm.unstakeToken({from: investor});
        result = await daiToken.balanceOf(investor);
        assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after unstaking');

        result = await daiToken.balanceOf(tokenFarm.address);
        assert.equal(result.toString(), tokens('0'), 'token farm Mock DAI wallet balance correct after unstaking');
    
        result = await tokenFarm.stakingBalance(investor);
        assert.equal(result.toString(), tokens('0'), 'please correct investor staking balance after unstaking');

        result = await tokenFarm.isStaking(investor);
        assert.equal(result.toString(), 'false', 'please correct investor staking status after unstake');
    
    })
        

    })
})