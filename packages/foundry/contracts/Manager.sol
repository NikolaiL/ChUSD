// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

/* Redstone Contract */
import { MainDemoConsumerBase } from "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";

/* In house contracts */
import { ManagerBase } from "./ManagerBase.sol";

/**
 * @title Manager
 * @notice Contract responsible for deposits, liquidations and collateral ratios
 * @dev This contract manages ChUSD minting, burning, and collateral management using Redstone oracles
 * @author https://x.com/0xjsieth
 *
 */
contract Manager is ManagerBase, MainDemoConsumerBase {
    //     ______                 __                  __
    //    / ____/___  ____  _____/ /________  _______/ /_____  _____
    //   / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    //  / /___/ /_/ / / / (__  ) /_/ /  / /_/ / /__/ /_/ /_/ / /
    //  \____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/

    /**
     * @notice
     *  Constructor for Manager contract
     *
     * @param _chUsd The address of the ChUSD token contract
     * @param _weth The address of the WETH contract
     * @param _oracle The address of the price oracle
     *
     */
    constructor(address _chUsd, address payable _weth, address _oracle) ManagerBase(_chUsd, _weth, _oracle) {
        // Constructor delegates to ManagerBase constructor
    }

    //     ____      __                        __   ______                 __  _
    //    /  _/___  / /____  _________  ____ _/ /  / ____/_  ______  _____/ /_(_)___  ____  _____
    //    / // __ \/ __/ _ \/ ___/ __ \/ __ `/ /  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  _/ // / / / /_/  __/ /  / / / / /_/ / /  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /___/_/ /_/\__/\___/_/  /_/ /_/\__,_/_/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    /**
     * @notice
     *  Gets the current ETH price from Redstone oracle
     *
     * @return The current ETH price from the oracle
     *
     */
    function _getEthPrice() internal view override returns (uint256) {
        // Get ETH price from Redstone oracle
        return getOracleNumericValueFromTxMsg(bytes32("ETH"));
    }

    //     ______     __                        __   ______                 __  _
    //    / ____/  __/ /____  _________  ____ _/ /  / ____/_  ______  _____/ /_(_)___  ____  _____
    //   / __/ | |/_/ __/ _ \/ ___/ __ \/ __ `/ /  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  / /____>  </ /_/  __/ /  / / / / /_/ / /  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /_____/_/|_|\__/\___/_/  /_/ /_/\__,_/_/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    /**
     * @notice
     *  Allows the contract to receive ETH
     *
     */
    receive() external payable {
        // Allow contract to receive ETH
    }
}