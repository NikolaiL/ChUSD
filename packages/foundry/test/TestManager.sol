// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import { ManagerBase } from "../contracts/ManagerBase.sol";

/**
 * @title TestManager
 * @notice Simplified Manager contract for testing with mock oracle
 * @author https://x.com/0xjsieth
 *
 */
contract TestManager is ManagerBase {
    constructor(address _chUsd, address payable _weth, address _oracle) ManagerBase(_chUsd, _weth, _oracle) { }

    function _getEthPrice() internal view override returns (uint256) {
        return 2000e8; // $2000 with 8 decimals
    }

    // Allow contract to receive ETH
    receive() external payable { }
}
