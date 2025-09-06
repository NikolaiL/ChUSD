//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import {DeployChUsd} from "./DeployChUsd.s.sol";
import {DeployManager} from "./DeployManager.s.sol";
import {ChUSD} from "../contracts/ChUSD.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    address payable weth = payable(address(0));
    address oracle = address(0);

    function run() external {
        // Deploys all your contracts sequentially
        // Add new deployments here when needed

        DeployChUsd deployChUsd = new DeployChUsd();
        address chUsd = deployChUsd.run();

        // Deploy another contract
        DeployManager deployManager = new DeployManager();
        address manager = deployManager.run(chUsd, weth, oracle);

        ChUSD(chUsd).setManager(manager);
    }
}
