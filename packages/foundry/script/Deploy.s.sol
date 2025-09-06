//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployChUsd } from "./DeployChUsd.s.sol";
import { DeployManager } from "./DeployManager.s.sol";
import { ChUSD } from "../contracts/ChUSD.sol";
import { Manager } from "../contracts/Manager.sol";
import { TestManager } from "../test/TestManager.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    address payable weth = payable(address(0));
    address oracle = address(0);

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
            // For production mode, use the deployment scripts
            DeployChUsd deployChUsd = new DeployChUsd();
            address chUsd = deployChUsd.run();

            // Deploy another contract
            DeployManager deployManager = new DeployManager();
            address manager = deployManager.run(chUsd, weth, oracle, _testMode);

            ChUSD(chUsd).setManager(manager);

            _chUsd = chUsd;
            _manager = manager;
        }
    }
}
