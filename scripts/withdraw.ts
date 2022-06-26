import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();
  console.log("Running under deployer: ", deployer);

  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log(
    "Found existing contract of deployer under address: ",
    fundMe.address,
    " ... now withdrawing funds...."
  );

  const txResponse = await fundMe.withdraw({
    gasLimit: 100000,
  });
  await txResponse.wait(1);
  console.log("withdrawed!");
}
main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
    throw error;
  });
