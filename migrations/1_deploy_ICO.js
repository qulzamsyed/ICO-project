const ICOTokenInvestment = artifacts.require('ICOTokenInvestment');

module.exports = async function (deployer) {
  //saleTime = Date.now() + 10000;
  await deployer.deploy(ICOTokenInvestment);
}