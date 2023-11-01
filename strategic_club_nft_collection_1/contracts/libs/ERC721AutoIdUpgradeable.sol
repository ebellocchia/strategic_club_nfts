// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//=============================================================//
//                           IMPORTS                           //
//=============================================================//
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";


/**
 * @author Emanuele B. (@emanueleb88)
 * @title  ERC721 token with automatic token ID handling.
 * @notice Token ID is automatically incremented when minting a new one
 */
abstract contract ERC721AutoIdUpgradeable is 
    Initializable,
    ERC721Upgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    //=============================================================//
    //                           STORAGE                           //
    //=============================================================//

    /// Current token ID
    CountersUpgradeable.Counter private _nextTokenId;

    //=============================================================//
    //                      PUBLIC FUNCTIONS                       //
    //=============================================================//

    /**
     * Get total token supply
     * @return Total token supply
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId.current();
    }

    //=============================================================//
    //                     INTERNAL FUNCTIONS                      //
    //=============================================================//

    /**
     * Initialize
     */
    function __ERC721AutoId_init() internal onlyInitializing {
        __ERC721AutoId_init_unchained();
    }

    /**
     * Initialize (unchained)
     */
    function __ERC721AutoId_init_unchained() internal onlyInitializing {
    }

    /**
     * Safe mint to `to_`
     * @param to_ Receiver address
     */
    function _safeMintTo(
        address to_
    ) internal virtual {
        uint256 curr_token_id = _nextTokenId.current();
        _nextTokenId.increment();
        _safeMint(to_, curr_token_id);
    }
}
