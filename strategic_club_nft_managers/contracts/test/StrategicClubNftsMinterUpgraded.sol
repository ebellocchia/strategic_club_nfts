// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//=============================================================//
//                           IMPORTS                           //
//=============================================================//
import "../StrategicClubNftsMinter.sol";


/**
 * @author Emanuele (@emanueleb88)
 * @title  To test the contract upgradeability
 */
contract StrategicClubNftsMinterUpgraded is
    StrategicClubNftsMinter
{
    //=============================================================//
    //                       PUBLIC FUNCTIONS                      //
    //=============================================================//

    /**
     * New function to check if the contract has been upgraded
     */
    function isUpgraded() public pure returns (bool) {
        return true;
    }
}
