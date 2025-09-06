// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

/* Redstone Contract */
import { RedstoneExtractor } from "./RedstoneExtractor.sol";

/* In house contracts */
import { ManagerBase } from "./ManagerBase.sol";

/**
 * @title Manager
 * @notice Contract responsible for deposits, liquidations and collateral ratios
 * @dev This contract manages ChUSD minting, burning, and collateral management using Redstone oracles
 * @author https://x.com/0xjsieth
 *
 */
contract Manager is ManagerBase {
    //     ______                 __                  __
    //    / ____/___  ____  _____/ /________  _______/ /_____  _____
    //   / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    //  / /___/ /_/ / / / (__  ) /_/ /  / /_/ / /__/ /_/ /_/ / /
    //  \____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/

    // RedStone Extractor contract for manual payload verification
    RedstoneExtractor public immutable redstoneExtractor;

    /**
     * @notice
     *  Constructor for Manager contract
     *
     * @param _chUsd The address of the ChUSD token contract
     * @param _weth The address of the WETH contract
     * @param _oracle The address of the price oracle
     * @param _redstoneExtractor The address of the RedStone Extractor contract
     *
     */
    constructor(address _chUsd, address payable _weth, address _oracle, address _redstoneExtractor) 
        ManagerBase(_chUsd, _weth, _oracle) 
    {
        redstoneExtractor = RedstoneExtractor(_redstoneExtractor);
    }

    //     ____      __                        __   ______                 __  _
    //    /  _/___  / /____  _________  ____ _/ /  / ____/_  ______  _____/ /_(_)___  ____  _____
    //    / // __ \/ __/ _ \/ ___/ __ \/ __ `/ /  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  _/ // / / / /_/  __/ /  / / / / /_/ / /  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /___/_/ /_/\__/\___/_/  /_/ /_/\__,_/_/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    /**
     * @notice
     *  Gets the current ETH price from Redstone oracle using manual payload
     *
     * @param redstonePayload The RedStone payload containing price data
     * @return The current ETH price from the oracle
     *
     */
    function _getEthPrice(bytes calldata redstonePayload) internal view returns (uint256) {
        // Get ETH price from Redstone oracle using manual payload
        return redstoneExtractor.extractPrice(keccak256("ETH"), redstonePayload);
    }

    /**
     * @notice
     *  Gets the current ETH price from Redstone oracle (fallback for compatibility)
     *
     * @return The current ETH price from the oracle (will revert - use manual payload version)
     *
     */
    function _getEthPrice() internal view override returns (uint256) {
        revert("Use _getEthPrice(bytes calldata redstonePayload) with manual payload");
    }

    //     ____        __    ___         ______                 __  _
    //    / __ \__  __/ /_  / (_)____   / ____/_  ______  _____/ /_(_)___  ____  _____
    //   / /_/ / / / / __ \/ / / ___/  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  / ____/ /_/ / /_/ / / / /__   / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /_/    \__,_/_.___/_/_/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    /**
     * @notice
     *  Calculates how much ChUSD can be minted for a given ETH amount using RedStone payload
     *
     * @param _ethAmount The amount of ETH to calculate mintable tokens for
     * @param redstonePayload The RedStone payload containing price data
     * @return _mintableAmount The maximum amount of ChUSD that can be minted
     *
     */
    function calculateMintableTokensWithPayload(uint256 _ethAmount, bytes calldata redstonePayload) 
        external 
        view 
        returns (uint256 _mintableAmount) 
    {
        // Get current ETH price from oracle using payload
        uint256 ethPrice = _getEthPrice(redstonePayload);
        // Calculate total ETH value in USD (with 8 decimal precision)
        uint256 totalEthValueInUsd = (_ethAmount * ethPrice * 1e10) / 1e18;
        // Calculate maximum mintable amount based on minimum collateral ratio
        _mintableAmount = (totalEthValueInUsd * 1e18) / MIN_COLLATERAL_RATIO;
    }

    /**
     * @notice
     *  Calculates how much additional ChUSD can be minted for a user with additional ETH using RedStone payload
     *
     * @param _user The address of the user
     * @param _additionalEthAmount The additional ETH amount to consider
     * @param redstonePayload The RedStone payload containing price data
     * @return _mintableAmount The additional amount of ChUSD that can be minted
     *
     */
    function calculateMintableTokensForUserWithPayload(
        address _user, 
        uint256 _additionalEthAmount, 
        bytes calldata redstonePayload
    ) 
        external 
        view 
        returns (uint256 _mintableAmount) 
    {
        // Get current ETH price from oracle using payload
        uint256 ethPrice = _getEthPrice(redstonePayload);
        // Calculate total ETH amount (existing + additional)
        uint256 totalEthAmount = depositOf[_user] + _additionalEthAmount;
        // Calculate total ETH value in USD (with 8 decimal precision)
        uint256 totalEthValueInUsd = (totalEthAmount * ethPrice * 1e10) / 1e18;
        // Calculate maximum mintable amount from total ETH value
        uint256 maxMintableFromTotal = (totalEthValueInUsd * 1e18) / MIN_COLLATERAL_RATIO;
        // Return additional mintable amount (max - already minted)
        _mintableAmount = maxMintableFromTotal > mintOf[_user] ? maxMintableFromTotal - mintOf[_user] : 0;
    }

    /**
     * @notice
     *  Returns the collateral ratio for a given user using RedStone payload
     *
     * @param _user The address of the user to check
     * @param redstonePayload The RedStone payload containing price data
     * @return _ratio The collateral ratio (deposited value / minted value)
     *
     */
    function collateralRatioWithPayload(address _user, bytes calldata redstonePayload) 
        public 
        view 
        returns (uint256 _ratio) 
    {
        // Calculate and return the collateral ratio using payload
        _ratio = _collateralRatioWithPayload(mintOf[_user], depositOf[_user], redstonePayload);
    }

    /**
     * @notice
     *  Internal function to calculate collateral ratio using RedStone payload
     *
     * @param _minted The amount of ChUSD minted
     * @param _deposited The amount of WETH deposited
     * @param redstonePayload The RedStone payload containing price data
     * @return _ratio The calculated collateral ratio
     *
     */
    function _collateralRatioWithPayload(
        uint256 _minted, 
        uint256 _deposited, 
        bytes calldata redstonePayload
    ) 
        internal 
        view 
        returns (uint256 _ratio) 
    {
        // If no ChUSD minted, return max ratio
        if (_minted == 0) return type(uint256).max;
        // Calculate total value using oracle price from payload
        uint256 totalValue = (_deposited * (_getEthPrice(redstonePayload) * 1e10)) / 1e18;
        // Return the ratio (multiply by 1e18 to maintain precision)
        _ratio = (totalValue * 1e18) / _minted;
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
