// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.30;

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import {ERC20} from "@solady/contracts/tokens/ERC20.sol";
import {Ownable} from "@solady/contracts/auth/Ownable.sol";

// quu..__
//  $$$b  `---.__
//   "$$b        `--.                          ___.---uuudP
//    `$$b           `.__.------.__     __.---'      $$$$"              .
//      "$b          -'            `-.-'            $$$"              .'|
//        ".                                       d$"             _.'  |
//          `.   /                              ..."             .'     |
//            `./                           ..::-'            _.'       |
//             /                         .:::-'            .-'         .'
//            :                          ::''\          _.'            |
//           .' .-.             .-.           `.      .'               |
//           : /'$$|           .@"$\           `.   .'              _.-'
//          .'|$u$$|          |$$,$$|           |  <            _.-'
//          | `:$$:'          :$$$$$:           `.  `.       .-'
//          :                  `"--'             |    `-.     \
//         :##.       ==             .###.       `.      `.    `\
//         |##:                      :###:        |        >     >
//         |#'     `..'`..'          `###'        x:      /     /
//          \                                   xXX|     /    ./
//           \                                xXXX'|    /   ./
//           /`-.                                  `.  /   /
//          :    `-  ...........,                   | /  .'
//          |         ``:::::::'       .            |<    `.
//          |             ```          |           x| \ `.:``.
//          |                         .'    /'   xXX|  `:`M`M':.
//          |    |                    ;    /:' xXXX'|  -'MMMMM:'
//          `.  .'                   :    /:'       |-'MMMM.-'
//           |  |                   .'   /'        .'MMM.-'
//           `'`'                   :  ,'          |MMM<
//             |                     `'            |tbap\
//              \                                  :MM.-'
//               \                 |              .''
//                \.               `.            /
//                 /     .:::::::.. :           /
//                |     .:::::::::::`.         /
//                |   .:::------------\       /
//               /   .''               >::'  /
//               `',:                 :    .'
//                                    `:.:'

/**
 * @title ChUsd
 * @notice ERC20 token for our new and simple stablecoin
 * @author https://x.com/0xjsieth
 *
 */
contract ChUSD is ERC20, Ownable {
    //     _____ __        __
    //    / ___// /_____ _/ /____  _____
    //    \__ \/ __/ __ `/ __/ _ \/ ___/
    //   ___/ / /_/ /_/ / /_/  __(__  )
    //  /____/\__/\__,_/\__/\___/____/

    /// @notice Address of the manager contract responsible for minting, liquidations, etc
    address public manager;

    //     ______                 __                  __
    //    / ____/___  ____  _____/ /________  _______/ /_____  _____
    //   / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    //  / /___/ /_/ / / / (__  ) /_/ /  / /_/ / /__/ /_/ /_/ / /
    //  \____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/

    /**
     * @notice Constructor for ChUSD contract
     * @dev Initializes the contract and sets the deployer as the initial owner
     */
    constructor() {
        // Initialize the owner to the deployer, only temporary
        // since we will set the manager contract as the owner later
        // in the same deployment script
        _initializeOwner(msg.sender);
    }

    /**
     * @notice 
     *  Sets the manager contract address and transfers ownership to it
     * @param _manager The address of the manager contract
     *
     */
    function setManager(address _manager) external onlyOwner {
        // Set the manager
        manager = _manager;
        // Make it the owner
        transferOwnership(_manager);
    }

    /**
     * @notice
     *  Returns the name of the token
     *
     * @return _name The name of the token
     *
     */
    function name() public pure override returns (string memory _name) {
        // Return the name of the token
        _name = "ChUSD";
    }

    /**
     * @notice
     *  Returns the symbol of the token
     *
     * @return _symbol The symbol of the token
     *
     */
    function symbol() public pure override returns (string memory _symbol) {
        // Return the symbol of the token
        _symbol = "ChUSD";
    }

    /**
     * @notice
     *  Mints new tokens to the specified address
     *
     * @param _to The address to mint tokens to
     *
     */
    function mint(address _to, uint _amount) public onlyOwner {
        // Mint the tokens to the specified address
        _mint(_to, _amount);
    }

    /**
     * @notice
     *  Burns tokens from the specified address
     *
     * @param _from The address to burn tokens from
     * @param _amount The amount of tokens to burn
     *
     */
    function burn(address _from, uint _amount) public onlyOwner {
        // Burn the tokens from the specified address
        _burn(_from, _amount);
    }
}
