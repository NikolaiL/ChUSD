// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

/* In house contracts */
import { ChUSD } from "./ChUSD.sol";

/* In house libraries */
import { CUErrors } from "./libraries/CUErrorrs.sol";

/* Solady Libraries */
import { WETH } from "@solady/contracts/tokens/WETH.sol";
import { SafeTransferLib } from "@solady/contracts/utils/SafeTransferLib.sol";

/**
 * @title ManagerBase
 * @notice contract responsible of deposits, liquidations and collateral ratios
 * @author https://x.com/0xjsieth
 *
 */
abstract contract ManagerBase {
    using SafeTransferLib for address;

    //     _____ __        __
    //    / ___// /_____ _/ /____  _____
    //    \__ \/ __/ __ `/ __/ _ \/ ___/
    //   ___/ / /_/ /_/ / /_/  __(__  )
    //  /____/\__/\__,_/\__/\___/____/

    // Minimal collateral ration
    uint64 public constant MIN_COLLATERAL_RATIO = 1.5e18;

    // ChUsd contract instance
    ChUSD public chUsd;

    // Weth instance
    WETH public weth;

    // Oracle address
    address public oracle;

    // Mapping to keep track of users deposits
    mapping(address user => uint256 deposit) public depositOf;

    // Mapping to keep track of users mints
    mapping(address user => uint256 minted) public mintOf;

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
    constructor(address _chUsd, address payable _weth, address _oracle) {
        // Set the ChUSD contract instance
        chUsd = ChUSD(_chUsd);
        // Set the WETH contract instance
        weth = WETH(_weth);
        // Set the oracle address
        oracle = _oracle;
    }

    //     ____                    __    __        ______                 __  _
    //    / __ \____ ___  ______ _/ /_  / /__     / ____/_  ______  _____/ /_(_)___  ____  _____
    //   / /_/ / __ `/ / / / __ `/ __ \/ / _ \   / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  / ____/ /_/ / /_/ / /_/ / /_/ / /  __/  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /_/    \__,_/\__, /\__,_/_.___/_/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/
    //

    /**
     * @notice
     *  Deposits ETH as collateral and mints ChUSD in one transaction
     *
     * @param _amount The amount of ChUSD to mint
     *
     */
    function depositAndMint(uint256 _amount) external payable {
        // Deposit the sent ETH as collateral
        _deposit(msg.value, msg.sender);
        // Mint the requested amount of ChUSD
        mint(_amount);
    }

    /**
     * @notice
     *  Deposits ETH as collateral without minting ChUSD
     *
     */
    function deposit() external payable {
        // Deposit the sent ETH as collateral
        _deposit(msg.value, msg.sender);
    }

    //     ______     __                        __   ______                 __  _
    //    / ____/  __/ /____  _________  ____ _/ /  / ____/_  ______  _____/ /_(_)___  ____  _____
    //   / __/ | |/_/ __/ _ \/ ___/ __ \/ __ `/ /  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  / /____>  </ /_/  __/ /  / / / / /_/ / /  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /_____/_/|_|\__/\___/_/  /_/ /_/\__,_/_/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    /**
     * @notice
     *  Burns ChUSD tokens and updates user's minted balance
     *
     * @param _amount The amount of ChUSD to burn
     *
     */
    function burn(uint256 _amount) external {
        // Update user's minted balance
        mintOf[msg.sender] -= _amount;
        // Burn the ChUSD tokens
        chUsd.burn(msg.sender, _amount);
    }

    /**
     * @notice
     *  Withdraws ETH collateral if collateral ratio remains sufficient
     *
     * @param _amount The amount of ETH to withdraw
     *
     */
    function withdraw(uint256 _amount) external {
        // Update user's deposit balance
        depositOf[msg.sender] -= _amount;
        // Check if collateral ratio is still sufficient
        if (collateralRatio(msg.sender) < MIN_COLLATERAL_RATIO) {
            revert CUErrors.TOO_LOW_COLLATERAL_RATIO();
        }
        // Convert WETH back to ETH
        weth.withdraw(_amount);
        // Transfer ETH to user
        msg.sender.safeTransferETH(_amount);
    }

    /**
     * @notice
     *  Liquidates a user with insufficient collateral ratio
     *
     * @param _user The address of the user to liquidate
     *
     */
    function liquidate(address _user) external {
        // Get the user's current collateral ratio
        uint256 userCollateralRatio = collateralRatio(_user);
        // Check if user can be liquidated
        if (userCollateralRatio > MIN_COLLATERAL_RATIO) {
            revert CUErrors.CANT_LIQUIDATE_USER(_user, userCollateralRatio);
        }
        // Burn the user's minted ChUSD
        chUsd.burn(msg.sender, mintOf[_user]);
        // Convert user's WETH to ETH
        weth.withdraw(depositOf[_user]);
        // Transfer the ETH to the liquidator
        msg.sender.safeTransferETH(depositOf[_user]);
        // Reset user's balances
        depositOf[_user] = 0;
        mintOf[_user] = 0;
    }

    /**
     * @notice
     *  Returns a quote for the collateral ratio if additional deposit is made
     *
     * @param _user The address of the user to quote for
     * @param _addedDeposit The additional deposit amount to consider
     *
     * @return _quoteRatio The projected collateral ratio
     *
     */
    function quote(address _user, uint256 _addedDeposit) external view returns (uint256 _quoteRatio) {
        // Calculate the collateral ratio with the additional deposit
        _quoteRatio = _collateralRatio((mintOf[_user] + _addedDeposit), depositOf[_user]);
    }

    //      ____        __    ___         ______                 __  _
    //     / __ \__  __/ /_  / (_)____   / ____/_  ______  _____/ /_(_)___  ____  _____
    //    / /_/ / / / / __ \/ / / ___/  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //   / ____/ /_/ / /_/ / / / /__   / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    //  /_/    \__,_/_.___/_/_/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    /**
     * @notice
     *  Mints ChUSD tokens if collateral ratio is sufficient
     *
     * @param _amount The amount of ChUSD to mint
     *
     */
    function mint(uint256 _amount) public {
        // Update user's minted balance
        mintOf[msg.sender] += _amount;
        // Check if collateral ratio is sufficient
        if (collateralRatio(msg.sender) < MIN_COLLATERAL_RATIO) {
            revert CUErrors.TOO_LOW_COLLATERAL_RATIO();
        }
        // Mint the ChUSD tokens
        chUsd.mint(msg.sender, _amount);
    }

    /**
     * @notice
     *  Returns the collateral ratio for a given user
     *
     * @param _user The address of the user to check
     *
     * @return _ratio The collateral ratio (deposited value / minted value)
     *
     */
    function collateralRatio(address _user) public view returns (uint256 _ratio) {
        // Calculate and return the collateral ratio
        _ratio = _collateralRatio(mintOf[_user], depositOf[_user]);
    }

    //     ____      __                        __   ______                 __  _
    //    /  _/___  / /____  _________  ____ _/ /  / ____/_  ______  _____/ /_(_)___  ____  _____
    //    / // __ \/ __/ _ \/ ___/ __ \/ __ `/ /  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  _/ // / / / /_/  __/ /  / / / / /_/ / /  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /___/_/ /_/\__/\___/_/  /_/ /_/\__,_/_/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    /**
     * @notice
     *  Internal function to calculate collateral ratio using oracle price
     *
     * @param _minted The amount of ChUSD minted
     * @param _deposited The amount of WETH deposited
     *
     * @return _ratio The calculated collateral ratio
     *
     */
    function _collateralRatio(uint256 _minted, uint256 _deposited) internal view returns (uint256 _ratio) {
        // If no ChUSD minted, return max ratio
        if (_minted == 0) return type(uint256).max;
        // Calculate total value using oracle price
        uint256 totalValue = (_deposited * (_getEthPrice() * 1e10)) / 1e18;
        // Return the ratio (multiply by 1e18 to maintain precision)
        _ratio = (totalValue * 1e18) / _minted;
    }

    /**
     * @notice
     *  Internal function to deposit ETH and update user's deposit balance
     *
     * @param _value The amount of ETH to deposit
     * @param _sender The address of the user depositing
     *
     */
    function _deposit(uint256 _value, address _sender) internal {
        // Convert ETH to WETH
        weth.deposit{ value: _value }();
        // Update user's deposit balance
        depositOf[_sender] += _value;
    }

    function _getEthPrice() internal view virtual returns (uint256);
}
