//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployChUsd } from "./DeployChUsd.s.sol";
import { DeployManager } from "./DeployManager.s.sol";
import { ChUSD } from "../contracts/ChUSD.sol";
import { Manager } from "../contracts/Manager.sol";
import { TestManager } from "../test/TestManager.sol";
import { Vm } from "forge-std/Vm.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    // Base Sepolia addresses
    address payable weth = payable(0x4200000000000000000000000000000000000006); // WETH on Base Sepolia
    address oracle = address(0x1234567890123456789012345678901234567890); // Replace with actual oracle address

    function run() external returns (address _chUsd, address _manager) {
        (_chUsd, _manager) = deploy(oracle, weth, false);
    }

    function deploy(address _oracle, address payable _weth, bool _testMode)
        public
        returns (address _chUsd, address _manager)
    {
        // Deploys all your contracts sequentially
        // Add new deployments here when needed

        if (_testMode) {
            // For test mode, deploy directly without ScaffoldETHDeployerRunner
            ChUSD chUsdContract = new ChUSD();
            TestManager managerContract = new TestManager(address(chUsdContract), _weth, _oracle);
            chUsdContract.setManager(address(managerContract));

            _chUsd = address(chUsdContract);
            _manager = address(managerContract);
        } else {
            // For production mode, deploy both contracts in the same broadcast context
            vm.startBroadcast();

            // Deploy ChUSD contract
            ChUSD chUsdContract = new ChUSD();
            address chUsd = address(chUsdContract);

            // Deploy Manager contract
            Manager managerContract = new Manager(chUsd, weth, oracle);
            address manager = address(managerContract);

            // Set manager on ChUSD contract
            chUsdContract.setManager(manager);

            vm.stopBroadcast();

            // Export deployments
            vm.serializeString("", vm.toString(chUsd), "ChUSD");
            vm.serializeString("", vm.toString(manager), "Manager");

            string memory chainIdStr = vm.toString(block.chainid);
            string memory path = string.concat(vm.projectRoot(), "/deployments/", chainIdStr, ".json");
            vm.writeJson("", path);

            _chUsd = chUsd;
            _manager = manager;
        }
    }
}
