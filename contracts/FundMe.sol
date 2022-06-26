// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error notEnoughEthSent();
error notOwner();

/** @title A contract for crowdfunding
 * @author mme
 * @notice this contract is for demo purpose only
 * @dev this contract implements s_PriceFeeds as library
 */
contract FundMe {
    using PriceConverter for uint256;

    address private immutable i_owner;
    AggregatorV3Interface private s_PriceFeed;
    uint256 private constant MIN_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert notOwner();
        }
        _;
    }

    constructor(address s_PriceFeedAddress) {
        i_owner = msg.sender;
        s_PriceFeed = AggregatorV3Interface(s_PriceFeedAddress);
    }

    // currently disabled, as I don't know yet how to unit test the receive and fallback methods
    //receive() external payable {
    //    fund();
    //}

    //fallback() external payable {
    //    fund();
    //}

    /**
     * @notice this function is to add funds to the contract, there is a min amt of 50USD
     * @dev there will be an error for too less eth sent, the function uses s_PriceFeeds
     */
    function fund() public payable {
        if (msg.value.getConversionRate(s_PriceFeed) < MIN_USD) {
            revert notEnoughEthSent();
        }

        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            s_addressToAmountFunded[s_funders[funderIndex]] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory m_funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < m_funders.length;
            funderIndex++
        ) {
            address m_funder = m_funders[funderIndex];
            s_addressToAmountFunded[m_funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_PriceFeed;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    /** @param funder address of the funder for whom to look up the amount funded
      * @return amountFunded will return the amount of the input adress. 
    
     */
    function getAmountToFunderAddress(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }
}
