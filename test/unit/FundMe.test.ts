/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { Address } from "hardhat-deploy/types";
import { FundMe, MockV3Aggregator } from "../../typechain";

describe("FundMe", () => {
  let fundMe: FundMe;
  let mockV3Aggregator: MockV3Aggregator;
  let deployer: Address;
  const sendValue: BigNumber = ethers.utils.parseEther("1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", () => {
    it("sets the aggregator address correctly for local network", async () => {
      const response: Address = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", () => {
    it("fails when amount of eth sent is too low", async () => {
      await expect(fundMe.fund()).to.be.revertedWith("notEnoughEthSent()");
    });

    it("should update the mapping after correct fund call with min amount sent", async () => {
      await fundMe.fund({ value: sendValue });
      const response: BigNumber = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("should update the array after successfull function call of fund", async () => {
      await fundMe.fund({ value: sendValue });
      const fundersLen = await fundMe.funders.length;
      const response: Address = await fundMe.funders(fundersLen);
      assert.equal(deployer, response);
    });
  });

  describe("withdraw", () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });
    it("should withdraw ETH from a single founder", async () => {
      const startFundMeBal: BigNumber = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startDeployerBal: BigNumber = await fundMe.provider.getBalance(
        deployer
      );
      const txResponse = await fundMe.withdraw();
      const txReceipt = await txResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = txReceipt;
      const gasConsumptionInEth = gasUsed.mul(effectiveGasPrice);
      const endFundMeBal: BigNumber = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endDeployerBal: BigNumber = await fundMe.provider.getBalance(
        deployer
      );

      assert.equal(endFundMeBal.toString(), "0");
      assert.equal(
        startFundMeBal.add(startDeployerBal).toString(),
        endDeployerBal.add(gasConsumptionInEth).toString()
      );
    });

    it("should be withdrawable by the deployer after multiple funders added eth", async () => {
      const accounts: SignerWithAddress[] = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        await fundMe.connect(accounts[i]).fund({ value: sendValue });
      }

      const startFundMeBal: BigNumber = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startDeployerBal: BigNumber = await fundMe.provider.getBalance(
        deployer
      );

      const txResponse = await fundMe.withdraw();
      const txReceipt = await txResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = txReceipt;
      const gasConsumptionInEth = gasUsed.mul(effectiveGasPrice);
      const endFundMeBal: BigNumber = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endDeployerBal: BigNumber = await fundMe.provider.getBalance(
        deployer
      );

      assert.equal(endFundMeBal.toString(), "0");
      assert.equal(
        startFundMeBal.add(startDeployerBal).toString(),
        endDeployerBal.add(gasConsumptionInEth).toString()
      );

      // make sure funders array is properly reset;
      await expect(fundMe.funders(0)).to.be.reverted;

      // make sure in the mappings are no values left
      for (let i = 1; i < 6; i++) {
        assert.equal(
          (await fundMe.addressToAmountFunded(accounts[0].address)).toString(),
          "0"
        );
      }
    });

    it("should revert if notOwner calls withdraw", async () => {
      const testUser: Address = (await getNamedAccounts()).testUser;
      const testSigner = await ethers.getSigner(testUser);
      await expect(fundMe.connect(testSigner).withdraw()).to.be.revertedWith(
        "notOwner()"
      );
    });
  });
});
