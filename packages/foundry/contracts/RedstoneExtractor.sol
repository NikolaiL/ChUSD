// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@redstone-finance/evm-connector/contracts/mocks/RedstoneConsumerNumericMock.sol";

/**
 * @title RedstoneExtractor
 * @dev Contract to extract and verify RedStone price data using manual payload approach
 * This allows us to use RedStone with viem without compatibility issues
 */
contract RedstoneExtractor is RedstoneConsumerNumericMock {
    /**
     * @dev Extract price from RedStone payload for a specific feed ID
     * @param feedId The feed ID to extract (e.g., keccak256("ETH"))
     * @param redstonePayload The RedStone payload containing price data
     * @return The extracted price value
     */
    function extractPrice(bytes32 feedId, bytes calldata redstonePayload) 
        public 
        view 
        returns (uint256) 
    {
        return getOracleNumericValueFromTxMsg(feedId);
    }
    
    /**
     * @dev Get multiple prices from RedStone payload
     * @param feedIds Array of feed IDs to extract
     * @param redstonePayload The RedStone payload containing price data
     * @return Array of extracted price values
     */
    function extractPrices(bytes32[] calldata feedIds, bytes calldata redstonePayload) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory prices = new uint256[](feedIds.length);
        for (uint256 i = 0; i < feedIds.length; i++) {
            prices[i] = getOracleNumericValueFromTxMsg(feedIds[i]);
        }
        return prices;
    }
}
