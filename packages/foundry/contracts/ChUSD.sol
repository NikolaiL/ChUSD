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

    // Address of the manager contract, that will be responsible of minting
    // liquidations, etc etc
    address public manager;

    //     ______                 __                  __
    //    / ____/___  ____  _____/ /________  _______/ /_____  _____
    //   / /   / __ \/ __ \/ ___/ __/ ___/ / / / ___/ __/ __ \/ ___/
    //  / /___/ /_/ / / / (__  ) /_/ /  / /_/ / /__/ /_/ /_/ / /
    //  \____/\____/_/ /_/____/\__/_/   \__,_/\___/\__/\____/_/

    /**
     * @notice
     *  Constructor for ChUSD contract
     *
     */
    constructor() {
        _initializeOwner(msg.sender);
    }

    function setManager(address _manager) external onlyOwner {
        // Set the manager
        manager = _manager;
        // Make it the ower
        transferOwnership(_manager);
    }

    function name() public view override returns (string memory _name) {
        _name = "ChUSD";
    }

    function symbol() public view override returns (string memory _symbol) {
        _symbol = "ChUSD";
    }

    function mint(address _to, uint _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    function burn(address _from, uint _amount) public onlyOwner {
        _burn(_from, _amount);
    }
}
