// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

import { MainDemoConsumerBase } from "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";
import { ManagerBase } from "./ManagerBase.sol";

contract Manager is ManagerBase, MainDemoConsumerBase {
    constructor(address _chUsd, address payable _weth, address _oracle) ManagerBase(_chUsd, _weth, _oracle) { }

    function _getEthPrice() internal view override returns (uint256) {
        return getOracleNumericValueFromTxMsg(bytes32("ETH"));
    }

    // Allow contract to receive ETH
    receive() external payable { }
}
