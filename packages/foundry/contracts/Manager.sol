// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

import {ChUSD} from "./ChUSD.sol";
import {CUErrors} from "./libraries/CUErrorrs.sol";
import {WETH} from "@solady/contracts/tokens/WETH.sol";
import {SafeTransferLib} from "@solady/contracts/utils/SafeTransferLib.sol";
import {MainDemoConsumerBase} from "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";

contract Manager is MainDemoConsumerBase {
    using SafeTransferLib for address;
    uint64 public constant MIN_COLLATERAL_RATIO = 1.5e18;
    ChUSD public chUsd;
    WETH public weth;
    address public oracle;
    mapping(address user => uint256 deposit) public depositOf;
    mapping(address user => uint256 minted) public mintOf;

    function deposit() public payable {
        weth.deposit{value: msg.value}();
        depositOf[msg.sender] += msg.value;
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
        uint256 minted = mintOf[_user];
        if (minted == 0) return type(uint256).max;
        uint256 totalValue = address2deposit[user] * (getOracleNumericValueFromTxMsg(bytes32("ETH") * 1e10) / 1e18;
        _ratio = totalValue / minted;
    }
}
