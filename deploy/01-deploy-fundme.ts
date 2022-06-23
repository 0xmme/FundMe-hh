// import statements outstanding

import { network } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { networkConfig } from "../helper-hardhat-config";

// this is the longer version of the code down there
// function deployFunc() {
//  console.log("test");
// }k
// module.exports.default = deployFunc

// module.exports.default = async (hre) => {
// const {getNamedAccounts, deployments} = hre;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const deployer = getNamedAccounts();
  const chainId = network.config.chainId;

  const priceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [],
    log: true,
  });
};
