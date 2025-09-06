// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

/**
 * @title CUErrors
 * @notice Library to manage errors in the ChUSD contract
 * @author https://x.com/0xjsieth
 *
 */
library CUErrors {
    error TOO_LOW_COLLATERAL_RATIO();
    error CANT_LIQUIDATE_USER(address user, uint256 collateralRatio);
}
