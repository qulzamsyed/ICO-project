const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { latestTime } = require('./latestTime');
const {increaseTimeTo,duration} = require('./increaseTime');
//const { describe } = require('jest-circus');
// const {time} = require('@openzeppelin/test-helpers');
// require('@openzeppelin/test-environment');
// const { describe } = require('jest-circus');
const BigNumber = web3.BigNumber;
//require('chai').use(require('chai-bignumber')(BigNumber)).should();
require('chai').use(require('chai-as-promised')).should();
const ICO = artifacts.require('ICOTokenInvestment');

contract('ICO testing',function(accounts) {
        beforeEach(async function(){
            this.timeNow = await latestTime();
            //console.log("time Now",this.timeNow);
            this.endICO = this.timeNow + duration.days(30);
            //console.log("thisICO",this.endICO);
            this.ico = await ICO.new();
        });
        
         it("check balance",async function(){
             await this.ico.mintToken(accounts[0]);
             return await this.ico.getBalance.call(accounts[0]).then(function(result){
                 assert.equal(result.toNumber(),10000,"should be zero");
             })
            });
        describe('Testing investing functions',function(){
            describe('testing make account function',function(){
            it("should reject with 0 token",async function(){
                await this.ico.mintToken(accounts[0]);
                await this.ico.makeInvesterAccount("qulzam",0).should.be.rejectedWith("You must invest as minimum as 1 token");
            });
            it("should reject with greater amount of token then your balance",async function(){
                await this.ico.mintToken(accounts[0]);
                await this.ico.makeInvesterAccount("qulzam",100000).should.be.rejectedWith("you dont have such amount");
            });
            it('testing make investment function',async function(){
                const icoAddress = await this.ico.address;
                await this.ico.mintToken(accounts[0]);
                await this.ico.makeInvesterAccount("qulzam",1000);
                return await this.ico.getBalance.call(icoAddress).then(function(result){
                    assert.equal(result.toNumber(),1000,"should be balance of 10000");
                })
            })
        });
        describe('Testing investTokens function',function(){
            it('should have account',async function(){
                await this.ico.investTokens(1000).should.be.rejectedWith("You don not have account");
            })
            it("should reject with 0 token",async function(){
                await this.ico.mintToken(accounts[0]);
                await this.ico.makeInvesterAccount("qulzam",100);
                await this.ico.investTokens(0).should.be.rejectedWith("You must invest as minimum as 1 token");
            });
            it("should reject with greater amount of token then your balance",async function(){
                await this.ico.mintToken(accounts[0]);
                await this.ico.makeInvesterAccount("qulzam",100);
                await this.ico.investTokens(100000).should.be.rejectedWith("you dont have such amount");
            });
            it('testing make account and then make another investment',async function(){
                const icoAddress = await this.ico.address;
                await this.ico.mintToken(accounts[0]);
                await this.ico.makeInvesterAccount("qulzam",1000);
                await this.ico.investTokens(1000);
                return await this.ico.getBalance.call(icoAddress).then(function(result){
                    assert.equal(result.toNumber(),2000,"should be balance of 10000");
                })
            });
            it('testing the account should be register to the mapping',async function(){
                await this.ico.mintToken(accounts[0]);
                await this.ico.makeInvesterAccount("qulzam",1000);
                return await this.ico.getNameOfAccountMemberById.call(0).then(function(result){
                    assert.equal(result.toString(),"qulzam");
                })
            });
            it('get total investment',async function(){
           
                for(let i = 0;i<=4;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",5000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.investTokens(5000);
                return await this.ico.getTotalInvestment.call().then(function(result){
                    assert.equal(result.toNumber(),50000,"total investment should be 50000");
                })
        })
        
    });
        describe('Testing Crowdsale function',function(){
            it("should reject with other then contract owner",async function(){
                await this.ico.mintToken(accounts[0]);
                await this.ico.makeInvesterAccount("qulzam",1000);
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale({from:accounts[1]}).should.be.rejectedWith("This function is restricted to the contract's owne");
            });
            it("should reject if sale start first from goal reached",async function(){
                for(let i = 0;i<=4;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",100,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",100,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",1000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",1000,{from:accounts[4]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale().should.be.rejectedWith("Goal limit is not reached");
            });
            it('should transfer 10% of the profit to the invester',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",9000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("aslam",10000,{from:accounts[5]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getBalance.call(accounts[2]).then(function(result){
                    assert.equal(result.toNumber(),11000,"account 0 must have 9900");
                })
            });
            it('should transfer 10% of the profit to the invester of account 3',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",9000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("usman",10000,{from:accounts[5]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getBalance.call(accounts[3]).then(function(result){
                    assert.equal(result.toNumber(),10900,"account 0 must have 9900");
                })
            });
            it('should transfer 10% of the profit to the invester of account 4',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",9000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",8000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("usman",10000,{from:accounts[5]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getBalance.call(accounts[4]).then(function(result){
                    assert.equal(result.toNumber(),10800,"account 0 must have 9900");
                })
            });
            it('After crowdsale total investMent should be 0',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getTotalInvestment.call().then(function(result){
                    assert.equal(result.toNumber(),0,"Total investment should be 0");
                })
            });
            it('After crowdsale total balance of the contract should be zero',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getBalance.call(this.ico.address).then(function(result){
                    assert.equal(result.toNumber(),0,"balance of the contract should be zero");
                })
            });

            it('After crowdsale every invester account investment should be 0',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getInvestedTokensById.call(accounts[0]).then(function(result){
                    assert.equal(result.toNumber(),0,"Invester account investment should be 0");
                })
            });
            it("should reject if sale start first then 30 days",async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",1000,{from:accounts[4]});
                await increaseTimeTo(this.endICO);
                  await this.ico.crowdSale().should.be.rejectedWith("Goal limit is not reached");
        });
        
        });
        describe("check withdraw function",async function(){
            it('should have account',async function(){
                await this.ico.withDrawTokens(1000).should.be.rejectedWith("You don not have account");
            })
            it('test if withdraw if goal limit is not reached but time is reached',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",9000);
                await this.ico.makeInvesterAccount("abbas",8000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",5000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await increaseTimeTo(this.endICO);
                await this.ico.withDrawTokens(1000,{from:accounts[3]});
                return await this.ico.getBalance.call(accounts[3]).then(async function(result){
                    assert.equal(result.toNumber(),6000,"should have balance of 8900");
                })
            })
            it("test balance of the account 3 after withdraw",async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",9000);
                await this.ico.makeInvesterAccount("abbas",8000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",5000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[6]});
                await this.ico.withDrawTokens(1000,{from:accounts[3]});
                return await this.ico.getBalance.call(accounts[3]).then(async function(result){
                    assert.equal(result.toNumber(),6000,"should have balance of 8900");
                })
            })
            it("test if first invester want to withdraw then they get 20% of profit",async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",9000);
                await this.ico.makeInvesterAccount("abbas",5000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[6]});
                await this.ico.withDrawTokens(1000);
                return await this.ico.getInvestedTokensById.call(0).then(async function(result){
                    assert.equal(result.toNumber(),9800,"should have balance of 8900");
                })
            })
            it("test if second invester want to withdraw then they get 20% of profit",async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",9000);
                await this.ico.makeInvesterAccount("abbas",5000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[6]});
                await this.ico.withDrawTokens(1000,{from:accounts[1]});
                return await this.ico.getInvestedTokensById.call(1).then(async function(result){
                    assert.equal(result.toNumber(),5000,"should have balance of 5000");
                })
            })
            it("test contract balance should decrease with withdraw",async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",5000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[6]});
                await this.ico.withDrawTokens(1000,{from:accounts[1]});
                return await this.ico.getBalance.call(this.ico.address).then(async function(result){
                    assert.equal(result.toNumber(),64000,"should have balance of 64000");
                })
            })
            
            it("should delete account if with withdraw as balance is 0",async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",5000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[6]});
                await this.ico.withDrawTokens(10000);
                return await this.ico.getBalance.call(this.ico.address).then(async function(result){
                    assert.equal(result.toNumber(),55000,"should have balance of 55000");
                })
            })
            it("check total investment after withdrawing amount ",async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",5000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.withDrawTokens(10000);
                return await this.ico.getTotalInvestment.call().then(async function(result){
                    assert.equal(result.toNumber(),45000,"should have balance of 55000");
                })
            })
        })
        describe('ICO scenerio based testing', async function(){
            it('test first make account, then invest, then withdraw and check balance',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",5000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.investTokens(3000,{from:accounts[3]});
                await this.ico.withDrawTokens(4000,{from:accounts[3]});
                return await this.ico.getBalance.call(accounts[3]).then(async function(result){
                    assert.equal(result.toNumber(),6000,"should have balance of 6000");
                })
            });
            it('test first make account, then invest, then withdraw,Crowdsale and check balance',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",10000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",5000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.investTokens(3000,{from:accounts[3]});
                await this.ico.withDrawTokens(4000,{from:accounts[3]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getBalance.call(accounts[3]).then(function(result){
                    assert.equal(result.toNumber(),10400,"should have balance of 10400");
                })
            });
            it.only('test first make account, then invest, then withdraw,Crowdsale and check balance',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",3000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.investTokens(2000,{from:accounts[1]});
                await this.ico.withDrawTokens(4000,{from:accounts[1]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getBalance.call(accounts[1]).then(function(result){
                    assert.equal(result.toNumber(),11200,"should have balance of 11200");
                })
            });
            it.only('test first make account, then invest, then withdraw,Crowdsale and check balance of contract',async function(){
                for(let i = 0;i<=6;i++){
                    await this.ico.mintToken(accounts[i]);
                }
                await this.ico.makeInvesterAccount("qulzam",10000);
                await this.ico.makeInvesterAccount("abbas",3000,{from:accounts[1]});
                await this.ico.makeInvesterAccount("ali",10000,{from:accounts[2]});
                await this.ico.makeInvesterAccount("Baqir",10000,{from:accounts[3]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[4]});
                await this.ico.makeInvesterAccount("umair",10000,{from:accounts[5]});
                await this.ico.investTokens(2000,{from:accounts[1]});
                await this.ico.withDrawTokens(4000,{from:accounts[1]});
                await increaseTimeTo(this.endICO);
                await this.ico.crowdSale();
                return this.ico.getBalance.call(this.ico.address).then(function(result){
                    assert.equal(result.toNumber(),0,"should have balance of 0");
                })
            });
        })
});
});
    