// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

import {ChUSD} from "./ChUSD.sol";
import {CUErrors} from "./libraries/CUErrorrs.sol";
import {WETH} from "@solady/contracts/tokens/WETH.sol";
import {SafeTransferLib} from "@solady/contracts/utils/SafeTransferLib.sol";
import {MainDemoConsumerBase} from "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";

/**
 * @title Manager
 * @notice contract responsible of deposits, liquidations and collateral ratios
 * @author https://x.com/0xjsieth
 *
 */
contract Manager is MainDemoConsumerBase {
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

    constructor(address _chUsd, address payable _weth, address _oracle) {
        chUsd = ChUSD(_chUsd);
        weth = WETH(_weth);
        oracle = _oracle;
    }

    function depositAndMint(uint256 _amount) public payable {
        _deposit(msg.value, msg.sender);
        mint(_amount);
    }

    function deposit() public payable {
        _deposit(msg.value, msg.sender);
    }

    function _deposit(uint256 _value, address _sender) internal {
        weth.deposit{value: _value};
        depositOf[_sender] += _value;
    }

    function burn(uint256 _amount) public {
        mintOf[msg.sender] -= _amount;
        chUsd.burn(msg.sender, _amount);
    }

    function mint(uint256 _amount) public {
        mintOf[msg.sender] += _amount;
        if (collateralRatio(msg.sender) < MIN_COLLATERAL_RATIO)
            revert CUErrors.TOO_LOW_COLLATERAL_RATIO();
        chUsd.mint(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) public {
        depositOf[msg.sender] -= _amount;
        if (collateralRatio(msg.sender) < MIN_COLLATERAL_RATIO)
            revert CUErrors.TOO_LOW_COLLATERAL_RATIO();
        weth.withdraw(_amount);
        msg.sender.safeTransferETH(_amount);
    }

    function liquidate(address _user) public {
        uint256 userCollateralRatio = collateralRatio(_user);
        if (userCollateralRatio > MIN_COLLATERAL_RATIO)
            revert CUErrors.CANT_LIQUIDATE_USER(_user, userCollateralRatio);
        chUsd.burn(msg.sender, mintOf[_user]);
        weth.withdraw(depositOf[_user]);
        msg.sender.safeTransferETH(depositOf[_user]);
        depositOf[_user] = 0;
        mintOf[_user] = 0;
    }

    function collateralRatio(
        address _user
    ) public view returns (uint256 _ratio) {
        _ratio = _collateralRatio(mintOf[_user], depositOf[_user]);
    }

    function quote(
        address _user,
        uint256 _addedDeposit
    ) external view returns (uint256 _quoteRatio) {
        _quoteRatio = _collateralRatio(
            (mintOf[_user] + _addedDeposit),
            depositOf[_user]
        );
    }

    function _collateralRatio(
        uint256 _minted,
        uint256 _deposited
    ) internal view returns (uint256 _ratio) {
        if (_minted == 0) return type(uint256).max;
        uint256 totalValue = (_deposited *
            (getOracleNumericValueFromTxMsg(bytes32("ETH")) * 1e10)) / 1e18;
        _ratio = totalValue / _minted;
    }
}
