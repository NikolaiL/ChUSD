// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

import {ChUSD} from "./ChUSD.sol";

contract Manager {
    uint64 public constant MIN_COLLAT_RATIO = 1.5e18;
    address public ChUsd;
    address public WETH;
    address public oracle;
    mapping(address user => uint256 deposit) public depositOf;
    mapping(address user => uint256 minted) public mintOf;

    function deposit(uint256 _amount) public {}

    function burn(uint256 _amount) public {}

    function mint(uint256 _amount) public {}

    function withdraw(uint256 _amount) public {}

    function liquidate(address _user) public {}

    function collatRatio(address _user) public view returns (uint256 _ratio) {}
}
