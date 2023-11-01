// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//=============================================================//
//                           IMPORTS                           //
//=============================================================//
import "./ERC20FixedSupply.sol";


/**
 * @author Emanuele (@emanueleb88)
 * @title  Strategic Club ERC20 token for official testing
 */
contract StrategicClubERC20Token is 
    ERC20FixedSupply 
{
    //=============================================================//
    //                           CONSTANTS                         //
    //=============================================================//

    // Token name
    string constant private TOKEN_NAME = "Strategic Club ERC20 Token";
    // Token symbol
    string constant private TOKEN_SYMBOL = "USDS";

    //=============================================================//
    //                         CONSTRUCTOR                         //
    //=============================================================//

    /**
     * Constructor
     * @param initialSupply_ Initial supply
     */
    constructor(
        uint256 initialSupply_
    )
        ERC20FixedSupply(TOKEN_NAME, TOKEN_SYMBOL, initialSupply_)
    {}

    //=============================================================//
    //                       PUBLIC FUNCTIONS                      //
    //=============================================================//

    /**
     * Mint `amount_` tokens to `to_`
     * @param to_     Target address
     * @param amount_ Amount
     */
    function mint(
        address to_,
        uint256 amount_
    ) public {
        _mint(to_, amount_);
    }
}
