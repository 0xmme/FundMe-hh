/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-unused-vars */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, DeployFunction } from "hardhat-deploy/types";
import { deployments, getNamedAccounts, network } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { networkConfig, devChains } from "../helper-hardhat-config";

// this is the longer version of the code down there
// function deployFunc() {
//  console.log("test");
// }k
// module.exports.default = deployFunc

// module.exports.default = async (hre) => {
// const {getNamedAccounts, deployments} = hre;

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  // const chainId: number = network.config.chainId!;
  let ethUsdPriceFeedAddress: Address;

  if (devChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!;
  }

  await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
  });

  log("-----------------------------------");
};

export default deployFunc;

deployFunc.tags = ["all", "fundMe"];
