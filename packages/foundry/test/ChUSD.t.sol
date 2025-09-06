// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import "forge-std/Test.sol";
import "../contracts/ChUSD.sol";
import "./TestManager.sol";
import "../contracts/libraries/CUErrorrs.sol";
import { WETH } from "@solady/contracts/tokens/WETH.sol";
import { DeployScript } from "../script/Deploy.s.sol";

/**
 * @title ChUSDTest
 * @notice Comprehensive test suite for ChUSD contract
 * @author https://x.com/0xjsieth
 *
 */
contract ChUSDTest is Test {
    //     _____ __        __
    //    / ___// /_____ _/ /____  _____
    //    \__ \/ __/ __ `/ __/ _ \/ ___/
    //   ___/ / /_/ /_/ / /_/  __(__  )
    //  /____/\__/\__,_/\__/\___/____/

    ChUSD public chUsd;
    TestManager public manager;
    WETH public weth;
    address public owner;
    address public user1;
    address public user2;

    //     ______                 __                  __
    //    / ____/___  ____  _____/ /________  _______/ /_____  _____
    //   / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    //  / /___/ /_/ / / / (__  ) /_/ / /  / /_/ / /__/ /_/ /_/ / /
    //  \____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/

    function setUp() external {
        // Deploy contracts
        DeployScript deployScript = new DeployScript();
        address chUsdAddress;
        address managerAddress;
        weth = new WETH();
        (chUsdAddress, managerAddress) = deployScript.deploy(address(0x1234), payable(address(weth)), true);
        chUsd = ChUSD(chUsdAddress);
        manager = TestManager(payable(managerAddress));

        // Set up accounts
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
    }

    //     ____        __         ____                              ______                 __  _
    //    / __ \____  / /_  __   / __ \_      ______  ___  _____   / ____/_  ______  _____/ /_(_)___  ____  _____
    //   / / / / __ \/ / / / /  / / / / | /| / / __ \/ _ \/ ___/  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  / /_/ / / / / / /_/ /  / /_/ /| |/ |/ / / / /  __/ /     / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    //  \____/_/ /_/_/\__, /   \____/ |__/|__/_/ /_/\___/_/     /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/
    //
    function testInitialState() external view {
        // Test initial token properties
        assertEq(chUsd.name(), "ChUSD");
        assertEq(chUsd.symbol(), "ChUSD");
        assertEq(chUsd.decimals(), 18);
        assertEq(chUsd.totalSupply(), 0);
        assertEq(chUsd.manager(), address(manager));
    }

    function testSetManager() external {
        // Test setting manager
        address newManager = makeAddr("newManager");

        // Deploy a new ChUSD contract for this test
        ChUSD newChUsd = new ChUSD();
        newChUsd.setManager(newManager);

        assertEq(newChUsd.manager(), newManager);
        assertEq(newChUsd.owner(), newManager);
    }

    function testSetManagerOnlyOwner() external {
        // Test that only owner can set manager
        vm.prank(user1);
        vm.expectRevert();
        chUsd.setManager(user1);
    }

    function testMint() external {
        // Test minting tokens
        uint256 _amount = 1000e18;

        vm.prank(address(manager));
        chUsd.mint(user1, _amount);

        assertEq(chUsd.balanceOf(user1), _amount);
        assertEq(chUsd.totalSupply(), _amount);
    }

    function testMintOnlyOwner() external {
        // Test that only owner can mint
        vm.prank(user1);
        vm.expectRevert();
        chUsd.mint(user1, 1000e18);
    }

    function testBurn() external {
        // Test burning tokens
        uint256 amount = 1000e18;

        // First mint some tokens
        vm.prank(address(manager));
        chUsd.mint(user1, amount);

        // Then burn them
        vm.prank(address(manager));
        chUsd.burn(user1, amount);

        assertEq(chUsd.balanceOf(user1), 0);
        assertEq(chUsd.totalSupply(), 0);
    }

    function testBurnOnlyOwner() external {
        // Test that only owner can burn
        vm.prank(user1);
        vm.expectRevert();
        chUsd.burn(user1, 1000e18);
    }

    function testBurnPartial() external {
        // Test burning partial amount
        uint256 mintAmount = 1000e18;
        uint256 burnAmount = 300e18;

        // Mint tokens
        vm.prank(address(manager));
        chUsd.mint(user1, mintAmount);

        // Burn partial amount
        vm.prank(address(manager));
        chUsd.burn(user1, burnAmount);

        assertEq(chUsd.balanceOf(user1), mintAmount - burnAmount);
        assertEq(chUsd.totalSupply(), mintAmount - burnAmount);
    }

    function testBurnMoreThanBalance() external {
        // Test burning more than balance
        uint256 amount = 1000e18;

        // Mint tokens
        vm.prank(address(manager));
        chUsd.mint(user1, amount);

        // Try to burn more than balance
        vm.prank(address(manager));
        vm.expectRevert();
        chUsd.burn(user1, amount + 1);
    }

    function testTransfer() external {
        // Test ERC20 transfer functionality
        uint256 amount = 1000e18;

        // Mint tokens to user1
        vm.prank(address(manager));
        chUsd.mint(user1, amount);

        // Transfer from user1 to user2
        vm.prank(user1);
        chUsd.transfer(user2, amount);

        assertEq(chUsd.balanceOf(user1), 0);
        assertEq(chUsd.balanceOf(user2), amount);
    }

    function testTransferFrom() external {
        // Test ERC20 transferFrom functionality
        uint256 amount = 1000e18;

        // Mint tokens to user1
        vm.prank(address(manager));
        chUsd.mint(user1, amount);

        // Approve user2 to spend user1's tokens
        vm.prank(user1);
        chUsd.approve(user2, amount);

        // Transfer from user1 to user2 via user2
        vm.prank(user2);
        chUsd.transferFrom(user1, user2, amount);

        assertEq(chUsd.balanceOf(user1), 0);
        assertEq(chUsd.balanceOf(user2), amount);
        assertEq(chUsd.allowance(user1, user2), 0);
    }

    //     ____        __    ___         ______                 __  _
    //    / __ \__  __/ /_  / (_)____   / ____/_  ______  _____/ /_(_)___  ____  _____
    //   / /_/ / / / / __ \/ / / ___/  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  / ____/ /_/ / /_/ / / / /__   / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /_/    \__,_/_.___/_/_/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    function testFuzzMint(uint256 _amount) external {
        // Fuzz test minting with random amounts
        vm.assume(_amount > 0 && _amount < type(uint128).max);

        vm.prank(address(manager));
        chUsd.mint(user1, _amount);

        assertEq(chUsd.balanceOf(user1), _amount);
        assertEq(chUsd.totalSupply(), _amount);
    }

    function testFuzzBurn(uint256 _mintAmount, uint256 _burnAmount) external {
        // Fuzz test burning with random amounts
        vm.assume(_mintAmount > 0 && _mintAmount < type(uint128).max);
        vm.assume(_burnAmount <= _mintAmount);

        // Mint tokens
        vm.prank(address(manager));
        chUsd.mint(user1, _mintAmount);

        // Burn tokens
        vm.prank(address(manager));
        chUsd.burn(user1, _burnAmount);

        assertEq(chUsd.balanceOf(user1), _mintAmount - _burnAmount);
        assertEq(chUsd.totalSupply(), _mintAmount - _burnAmount);
    }

    function testFuzzTransfer(uint256 _amount, address _to) external {
        // Fuzz test transfer with random amounts and addresses
        vm.assume(_amount > 0 && _amount < type(uint128).max);
        vm.assume(_to != address(0) && _to != user1);

        // Mint tokens to user1
        vm.prank(address(manager));
        chUsd.mint(user1, _amount);

        // Transfer tokens
        vm.prank(user1);
        chUsd.transfer(_to, _amount);

        assertEq(chUsd.balanceOf(user1), 0);
        assertEq(chUsd.balanceOf(_to), _amount);
    }

    //     ____      __                        __   ______                 __  _
    //    /  _/___  / /____  _________  ____ _/ /  / ____/_  ______  _____/ /_(_)___  ____  _____
    //    / // __ \/ __/ _ \/ ___/ __ \/ __ `/ /  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
    //  _/ // / / / /_/  __/ /  / / / / /_/ / /  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
    // /___/_/ /_/\__/\___/_/  /_/ /_/\__,_/_/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/

    function testInvariantTotalSupply() external {
        // Test that total supply equals sum of all balances
        uint256 totalMinted = 0;
        uint256 totalBurned = 0;

        // Mint to multiple users
        vm.prank(address(manager));
        chUsd.mint(user1, 1000e18);
        totalMinted += 1000e18;

        vm.prank(address(manager));
        chUsd.mint(user2, 2000e18);
        totalMinted += 2000e18;

        // Burn some tokens
        vm.prank(address(manager));
        chUsd.burn(user1, 500e18);
        totalBurned += 500e18;

        assertEq(chUsd.totalSupply(), totalMinted - totalBurned);
        assertEq(chUsd.balanceOf(user1) + chUsd.balanceOf(user2), chUsd.totalSupply());
    }

    function testInvariantBalanceConsistency() external {
        // Test that balances are consistent after operations
        uint256 amount1 = 1000e18;
        uint256 amount2 = 2000e18;

        // Mint to user1
        vm.prank(address(manager));
        chUsd.mint(user1, amount1);

        // Mint to user2
        vm.prank(address(manager));
        chUsd.mint(user2, amount2);

        // Transfer from user1 to user2
        vm.prank(user1);
        chUsd.transfer(user2, amount1);

        // Check balances are consistent
        assertEq(chUsd.balanceOf(user1), 0);
        assertEq(chUsd.balanceOf(user2), amount1 + amount2);
        assertEq(chUsd.totalSupply(), amount1 + amount2);
    }
}
