// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error notEnoughEthSent();
error notOwner();

/** @title A contract for crowdfunding
 * @author mme
 * @notice this contract is for demo purpose only
 * @dev this contract implements pricefeeds as library
 */
contract FundMe {
    using PriceConverter for uint256;

    address immutable i_owner;
    AggregatorV3Interface public priceFeed;
    uint256 public constant MIN_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert notOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice this function is to add funds to the contract, there is a min amt of 50USD
     * @dev there will be an error for too less eth sent, the function uses pricefeeds
     */
    function fund() public payable {
        if (msg.value.getConversionRate(priceFeed) < MIN_USD) {
            revert notEnoughEthSent();
        }

        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            addressToAmountFunded[funders[funderIndex]] = 0;
        }
        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }
}
