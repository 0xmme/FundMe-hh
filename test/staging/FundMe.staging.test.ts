/* eslint-disable no-unused-expressions */
/* eslint-disable node/no-missing-import */
import { assert } from "chai";
import { BigNumber } from "ethers";
import { getNamedAccounts, ethers, network } from "hardhat";
import { Address } from "hardhat-deploy/types";
import { devChains } from "../../helper-hardhat-config";
import { FundMe } from "../../typechain";

devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let deployer: Address;
      let fundMe: FundMe;
      const sendValue: BigNumber = ethers.utils.parseEther("0.1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund the contract", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw({ gasLimit: 100000 });
        const endBal: BigNumber = await fundMe.provider.getBalance(
          fundMe.address
        );
        assert.equal(endBal.toString(), "0");
      });
    });
